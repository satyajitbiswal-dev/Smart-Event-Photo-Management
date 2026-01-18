from channels.middleware import BaseMiddleware
from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.db import close_old_connections
from urllib.parse import parse_qs
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.backends import TokenBackend
from django.conf import settings


@database_sync_to_async
def get_user(user_id):
    try:
        return get_user_model().objects.get(id=user_id)
    except get_user_model().DoesNotExist:
        return AnonymousUser()


class JwtAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        close_old_connections()

        print("🔥 RAW QUERY STRING:", scope["query_string"])

        query_params = parse_qs(scope["query_string"].decode())
        token_list = query_params.get("token")

        if not token_list:
            scope["user"] = AnonymousUser()
            return await super().__call__(scope, receive, send)

        token = token_list[0]

        try:
            # Validate token
            UntypedToken(token)

            token_backend = TokenBackend(
                algorithm=settings.SIMPLE_JWT["ALGORITHM"],
                signing_key=settings.SIMPLE_JWT["SIGNING_KEY"],
            )

            decoded = token_backend.decode(token, verify=True)

            print("🔥 JWT DECODED:", decoded)

            scope["user"] = await get_user(decoded["user_id"])

        except (InvalidToken, TokenError, KeyError) as e:
            print("❌ JWT ERROR:", e)
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)


def JwtAuthMiddlewareStack(inner):
    return JwtAuthMiddleware(AuthMiddlewareStack(inner))
