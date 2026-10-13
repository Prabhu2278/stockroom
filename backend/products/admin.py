from django.contrib import admin

from .models import Product, StockMovement, Supplier

admin.site.register(Supplier)
admin.site.register(Product)
admin.site.register(StockMovement)
