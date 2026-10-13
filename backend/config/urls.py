from django.contrib import admin
from django.http import HttpResponse
from django.urls import include, path


def home(request):
    return HttpResponse(
        "<h2>StockRoom backend is running.</h2>"
        "<p>Open the app here: <a href='http://localhost:5173'>http://localhost:5173</a></p>"
        "<p>Data check: <a href='/api/products/'>/api/products/</a></p>"
    )


urlpatterns = [
    path("", home),
    path("admin/", admin.site.urls),
    path("api/", include("products.urls")),
]