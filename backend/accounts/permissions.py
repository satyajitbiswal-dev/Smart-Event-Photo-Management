from rest_framework.permissions import BasePermission


class IsMember(BasePermission):
     message = "You must be a member to get this"
     def has_permission(self,request,view):
          return bool(
               request.user
               and request.user.is_authenticated
               and request.user.role == "M"
          )

class IsAdmin(BasePermission):
     message = "You must be an Admin to get this"
     def has_permission(self,request,view):
          return bool(
               request.user
               and request.user.is_authenticated
               and request.user.role == "A"
          )

class IsPublic(BasePermission):
     message = "You must be an Admin to get this"
     def has_permission(self,request,view):
          return bool(
               request.user
               and request.user.is_authenticated
               and request.user.role == "P"
          )         



















GLOBAL_ROLE = {
    "P":{
        'is_staff':False,
        'is_superuser':False,
        'is_active':False
     },
     "M":{
        'is_staff':True,
        'is_superuser':False,
        'is_active':True
     },
     "A":{
        'is_staff':True,
        'is_superuser':True,
        'is_active':True
     }
}

