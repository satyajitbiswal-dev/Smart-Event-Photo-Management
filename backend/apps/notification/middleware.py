from django.contrib.auth.models import AnonymousUser
from rest_framework.authtoken.models import Token
from channels.db import database_sync_to_async


@database_sync_to_async
def get_user(token_key):
    try:
        token = Token.objects.select_related("user").get(key=token_key)
        return token.user
    except Token.DoesNotExist:
        return AnonymousUser()


class TokenAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        headers = dict(scope.get("headers", []))
        user = AnonymousUser()

        auth = headers.get(b"authorization")
        if auth:
            try:
                auth = auth.decode()
                prefix, token_key = auth.split()
                if prefix.lower() == "token":
                    user = await get_user(token_key)
            except Exception:
                pass

        scope["user"] = user
        return await self.app(scope, receive, send)
