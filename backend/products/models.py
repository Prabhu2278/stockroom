from django.db import models


class Supplier(models.Model):
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=120)
    category = models.CharField(max_length=60)
    qty = models.PositiveIntegerField(default=0)
    price = models.PositiveIntegerField(default=0)
    min_level = models.PositiveIntegerField(default=10)  # low-stock limit
    supplier = models.ForeignKey(
        Supplier, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="products",
    )

    def __str__(self):
        return self.name


class StockMovement(models.Model):
    KIND_CHOICES = [("in", "Stock in"), ("out", "Stock out")]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="movements")
    kind = models.CharField(max_length=3, choices=KIND_CHOICES)
    qty = models.PositiveIntegerField()
    note = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.kind} {self.qty} x {self.product.name}"
