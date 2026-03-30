from rest_framework import ModelSerializer
from ..models import Post

class postSerializer(ModelSerializer):
    class Meta:
        Model = Post
        fields = ('id, title, body')