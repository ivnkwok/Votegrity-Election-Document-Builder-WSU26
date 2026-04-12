import json
import os
from django.http import JsonResponse
from django.conf import settings
from rest_framework.decorators import api_view

ELECTION_FILES = {
    "election1": "election1.json",
    "election2": "election2.json",
    "election3": "election3.json",
    "election4": "election4.json",
}

@api_view(["GET"])
def get_election_data(request, election_id):
    filename = ELECTION_FILES.get(election_id)

    if not filename:
        return JsonResponse({"error": "Invalid election ID"}, status=400)

    file_path = os.path.join(settings.BASE_DIR, "election_data", filename)

    try:
        with open(file_path, "r") as f:
            data = json.load(f)
        return JsonResponse(data, safe=False)
    except FileNotFoundError:
        return JsonResponse({"error": "File not found"}, status=404)