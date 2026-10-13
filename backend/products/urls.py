from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import MovementViewSet, ProductViewSet, SupplierViewSet, dashboard

router = DefaultRouter()
router.register("products", ProductViewSet)
router.register("suppliers", SupplierViewSet)
router.register("movements", MovementViewSet)

urlpatterns = [
    path("dashboard/", dashboard),
    path("", include(router.urls)),
]
