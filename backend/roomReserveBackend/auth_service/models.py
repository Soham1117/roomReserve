from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Role(models.Model):
    """
    Represents a user role (e.g., 'user', 'admin').
    Corresponds to the 'roles' table created by auth.sql.
    """
    # Note: Django automatically creates an 'id' field (AutoField) as primary key
    # if no other field is specified as primary_key=True.
    # This matches the SERIAL PRIMARY KEY from the SQL.
    name = models.CharField(max_length=50, unique=True, null=False)

    def __str__(self):
        return self.name

    # Meta class removed - let Django use default table name 'auth_service_role'

# Note on User-Role Relationship:
# The 'user_roles' table (or similar) will be automatically created by Django
# if a ManyToManyField is defined linking User and Role.
# In Django, this is typically handled by adding a ManyToManyField
# to one of the related models. For example, you could add:
#   roles = models.ManyToManyField(Role, related_name='users')
# to the User model (potentially via a User Profile model extending the base User).
# Or add:
#   users = models.ManyToManyField(User, related_name='roles')
# to the Role model.
# Since we are using the built-in User model, extending it via a OneToOneField
# to a profile model is the standard approach to add extra fields like roles.
# For now, we've defined the Role model. The relationship management
# can be implemented when building the actual service logic.
# Django's migration system would typically create the intermediate
# 'user_roles' table automatically if a ManyToManyField were defined.
# Since we created it manually, we need to be aware of this when using the ORM.
