from django.core.management.base import BaseCommand

from products.models import Product, StockMovement, Supplier


class Command(BaseCommand):
    help = "Add sample suppliers and products"

    def handle(self, *args, **options):
        if Supplier.objects.exists():
            self.stdout.write("Sample data already added.")
            return
        a = Supplier.objects.create(name="Sri Murugan Traders", phone="98765 43210", email="orders@murugan.example")
        b = Supplier.objects.create(name="Coastal Foods", phone="97890 11223", email="sales@coastal.example")
        c = Supplier.objects.create(name="Annapoorna Wholesale", phone="90030 55667", email="hello@annapoorna.example")
        rows = [
            ("Basmati Rice 5kg", "Grocery", 48, 520, 15, a),
            ("Sunflower Oil 1L", "Grocery", 9, 145, 12, b),
            ("Toor Dal 1kg", "Grocery", 0, 165, 10, a),
            ("Tea Powder 500g", "Beverages", 32, 240, 10, c),
            ("Filter Coffee 250g", "Beverages", 7, 210, 8, c),
            ("Salt 1kg", "Grocery", 60, 22, 20, b),
            ("Bath Soap (4 pack)", "Household", 25, 130, 10, b),
            ("Detergent Powder 1kg", "Household", 14, 110, 10, a),
        ]
        for name, cat, qty, price, low, sup in rows:
            Product.objects.create(name=name, category=cat, qty=qty, price=price, min_level=low, supplier=sup)
        rice = Product.objects.get(name="Basmati Rice 5kg")
        StockMovement.objects.create(product=rice, kind="in", qty=20, note="Weekly delivery")
        self.stdout.write("Sample data added.")
