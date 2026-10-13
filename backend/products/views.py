from django.db import transaction
from django.db.models import Sum
from rest_framework import mixins, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Product, StockMovement, Supplier
from .serializers import MovementSerializer, ProductSerializer, SupplierSerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related("supplier").order_by("-id")
    serializer_class = ProductSerializer


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.order_by("name")
    serializer_class = SupplierSerializer


class MovementViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = StockMovement.objects.select_related("product")
    serializer_class = MovementSerializer

    def perform_create(self, serializer):
        # save the movement and change the product quantity together
        with transaction.atomic():
            movement = serializer.save()
            product = movement.product
            product.qty += movement.qty if movement.kind == "in" else -movement.qty
            product.save()


@api_view(["GET"])
def dashboard(request):
    products = list(Product.objects.all())
    low = [p for p in products if p.qty <= p.min_level]
    by_category = (
        Product.objects.values("category").annotate(total=Sum("qty")).order_by("category")
    )
    recent = StockMovement.objects.select_related("product")[:5]
    return Response({
        "total_products": len(products),
        "low_count": len(low),
        "stock_value": sum(p.qty * p.price for p in products),
        "supplier_count": Supplier.objects.count(),
        "by_category": [{"category": c["category"], "total": c["total"] or 0} for c in by_category],
        "low_items": ProductSerializer(low, many=True).data,
        "recent": MovementSerializer(recent, many=True).data,
    })
