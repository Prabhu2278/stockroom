from rest_framework import serializers

from .models import Product, StockMovement, Supplier


class SupplierSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Supplier
        fields = ["id", "name", "phone", "email", "product_count"]

    def get_product_count(self, obj):
        return obj.products.count()


class ProductSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source="supplier.name", read_only=True, default="")

    class Meta:
        model = Product
        fields = ["id", "name", "category", "qty", "price", "min_level", "supplier", "supplier_name"]


class MovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = StockMovement
        fields = ["id", "product", "product_name", "kind", "qty", "note", "created_at"]
        read_only_fields = ["created_at"]

    def validate(self, data):
        if data["qty"] < 1:
            raise serializers.ValidationError({"qty": "Quantity must be at least 1."})
        if data["kind"] == "out" and data["qty"] > data["product"].qty:
            raise serializers.ValidationError(
                {"qty": f"Only {data['product'].qty} in stock. Enter {data['product'].qty} or less."}
            )
        return data
