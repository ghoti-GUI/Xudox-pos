
from django.db import models
 
class Test(models.Model):
    name = models.CharField(max_length=20)
    des = models.CharField("description", max_length=200)
    def __str__(self):
        return self.name
    class Meta:
        db_table = "Test"


class TestForeignkey(models.Model):
    foreignkey_name = models.ForeignKey(Test, on_delete=models.CASCADE)
    age = models.IntegerField()

    class Meta:
        db_table = "TestForeignkey"




class product(models.Model):
    class Meta:
        db_table = "product"

    # def __str__(self):
    #     return self.zname

    id_user = models.IntegerField()
    id_Xu = models.IntegerField()
    ename = models.CharField(max_length=200)
    lname = models.CharField(max_length=200)
    fname = models.CharField(max_length=200)
    zname = models.CharField(max_length=200)
    print_name = models.CharField(max_length=100)
    extra_name = models.CharField(max_length=1000)
    edes = models.CharField(max_length=1000)
    ldes = models.CharField(max_length=1000)
    fdes = models.CharField(max_length=1000)
    img = models.CharField(max_length=200)
    color = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    price2 = models.DecimalField(max_digits=8, decimal_places=2)
    price_extra = models.CharField(max_length=2000)
    TVA_country = models.CharField(max_length=200)
    TVA = models.DecimalField(max_digits=8, decimal_places=2)
    extra_TVA = models.DecimalField(max_digits=8, decimal_places=2)
    time_supply = models.IntegerField()
    soldout = models.BooleanField()
    min_nbr = models.IntegerField()
    rid = models.IntegerField()
    stb = models.IntegerField()
    position = models.IntegerField()
    favourite = models.IntegerField()
    follow_id = models.IntegerField()
    extra_id = models.IntegerField()
    Xu_class = models.CharField(max_length=200)
    custom = models.CharField(max_length=200)
    custom2 = models.CharField(max_length=200)
    custom3 = models.CharField(max_length=200)
    custom4 = models.CharField(max_length=200)
    custom5 = models.CharField(max_length=200)
    # print_to_where = models.ForeignKey(print_to_where, on_delete=models.CASCADE)
    # cid = models.ForeignKey(category, on_delete=models.CASCADE)
    # option_id = models.ForeignKey(option_list, on_delete=models.CASCADE)
    print_to_where = models.IntegerField()
    cid = models.IntegerField()
    option_id = models.IntegerField()

    

