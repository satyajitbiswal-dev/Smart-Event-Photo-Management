from rest_framework.permissions import BasePermission
from apps.event.models import Event
from django.shortcuts import get_object_or_404
class IsMemberUser(BasePermission):
     message = "You must be a member to get this"
     def has_permission(self,request,view):
          return bool(
               request.user
               and request.user.is_authenticated
               and request.user.status == 'A'
               and ( request.user.role == "M" or request.user.role == 'A')
          )

class IsAdminUser(BasePermission):
     message = "You must be an Admin to access this"
     def has_permission(self,request,view):
          return bool(
               request.user
               and request.user.is_authenticated
               and request.user.status == "A"
               and request.user.role == "A"
          )

class IsPublicUser(BasePermission):
     message = "You must be an Admin to get this"
     def has_permission(self,request,view):
          return bool(
               request.user
               and request.user.role == "P"
          )         

class IsEventCoordinator(BasePermission):
     message = "You must be the event Coordinator to access this"
     def has_permission(self, request, view):
          return bool(
               request.user
               and request.user.is_authenticated
               and request.user.status == 'A'
               and request.user.role != "P" 
          )
     def has_object_permission(self, request, view, obj):
          if request.user.role == "A":
               return True
          return obj.event_coordinator == request.user 

class IsEventPhotoGrapher(BasePermission):
     message = "You must be the photographer or Event coordinator of the event to access this"
     def has_permission(self, request, view):
          base_permission = bool(
               request.user
               and request.user.is_authenticated
               and request.user.status == 'A'
               and request.user.role != "P" 
          )

          if base_permission == False:
               return False
          
          if request.user.role == "A":
               return True
          event_id = view.kwargs["id"]
          event = get_object_or_404(Event,id=event_id)

          return ( request.user == event.event_photographer or request.user == event.event_coordinator)

     def has_object_permission(self, request, view, obj):
          if request.user.role == "A":
               return True
          return obj.event.event_photographer == request.user or obj.event.event_coordinator == request.user 

GLOBAL_ROLE = {
    "P":{
        'is_staff':False,
        'is_superuser':False,
        'is_active':True
     },
     "M":{
        'is_staff':False,
        'is_superuser':False,
        'is_active':True
     },
     "A":{
        'is_staff':False,
        'is_superuser':False,
        'is_active':True
     }
}

