from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admin users (superuser or staff) to edit objects.
    Allows read-only access for everyone else.
    """

    def has_permission(self, request, view):
        # Allow read-only methods (GET, HEAD, OPTIONS) for any request.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed if the user is authenticated AND is staff/superuser.
        return request.user and request.user.is_authenticated and request.user.is_staff

# Example for later: Permission based on object ownership (e.g., for a HotelManager model)
# class IsHotelManagerOrReadOnly(permissions.BasePermission):
#     """
#     Allows read-only for anyone, but write access only to the manager associated with the hotel.
#     Assumes the view's object (e.g., Hotel, RoomType) has a link to a manager or owner.
#     """
#     def has_object_permission(self, request, view, obj):
#         if request.method in permissions.SAFE_METHODS:
#             return True
#
#         # Check if the request.user is the manager for this hotel object
#         # This requires a specific relationship, e.g., obj.manager == request.user
#         # Or obj.hotel.manager == request.user for RoomType
#         # Placeholder logic:
#         # return hasattr(obj, 'manager') and obj.manager == request.user
#         return request.user and request.user.is_authenticated and request.user.is_staff # Fallback to staff for now
