# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class category(models.Model):
    # id = models.AutoField()
    ename = models.CharField(max_length=200)
    lname = models.CharField(max_length=200)
    fname = models.CharField(max_length=200)
    zname = models.CharField(max_length=200)
    extra_name = models.CharField(max_length=1000)
    edes = models.CharField(max_length=1000)
    ldes = models.CharField(max_length=1000)
    fdes = models.CharField(max_length=1000)
    img = models.CharField(max_length=200)
    time_supply = models.IntegerField()
    rid = models.IntegerField()
    category_class = models.IntegerField()
    sort_id = models.IntegerField()
    custom = models.CharField(max_length=200)
    custom1 = models.CharField(max_length=200)
    custom2 = models.CharField(max_length=200)

    class Meta:
        managed = False
        db_table = 'category'


class choice(models.Model):
    # id = models.AutoField()
    pid = models.IntegerField(db_comment='product ID')
    choicetype = models.ForeignKey('choicetype', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'choice'


class choicetype(models.Model):
    # id = models.AutoField()
    edes = models.CharField(max_length=1000)
    ldes = models.CharField(max_length=1000)
    fdes = models.CharField(max_length=1000)
    min = models.IntegerField()
    max = models.IntegerField()
    required = models.IntegerField()
    option_list = models.ForeignKey('option_list', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'choicetype'


class option_list(models.Model):
    # id = models.AutoField()
    rid = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'option_list'


class printe_to_where(models.Model):
    # id = models.AutoField()
    printer = models.CharField(max_length=1000, db_comment='print to where list id')
    cutgroup = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'printe_to_where'


class product(models.Model):
    # id = models.AutoField()
    id_user = models.IntegerField(default=0)
    id_Xu = models.IntegerField(db_column='id_Xu', default=0)  
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
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    price2 = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    price_extra = models.CharField(max_length=2000)
    TVA_country = models.CharField(db_column='TVA_country', max_length=200)  
    TVA = models.DecimalField(db_column='TVA', max_digits=8, decimal_places=2, default=0)  
    extra_TVA = models.DecimalField(db_column='extra_TVA', max_digits=8, decimal_places=2, default=0)  
    time_supply = models.IntegerField(db_comment='supply time', default=0)
    product_type = models.IntegerField(db_comment='product/set/option', default=0)
    soldout = models.IntegerField(default=0)
    min_nbr = models.IntegerField(db_comment='minimum purchase nbr', default=0)
    rid = models.IntegerField(db_comment='restaurant id', default=0)
    stb = models.IntegerField(db_comment='sushi to bar', default=0)
    position = models.IntegerField(default=0)
    favourite = models.IntegerField(default=0)
    follow_id = models.IntegerField(default=0)
    extra_id = models.IntegerField(default=0)
    xu_class = models.CharField(db_column='Xu_class', max_length=200)  # Field name made lowercase.
    custom = models.CharField(max_length=200, db_comment='customisation')
    custom2 = models.CharField(max_length=200, db_comment='customisation 2')
    custom3 = models.CharField(max_length=200)
    custom4 = models.CharField(max_length=200)
    custom5 = models.CharField(max_length=200)
    print_to_where = models.ForeignKey(printe_to_where, models.DO_NOTHING, db_column='print_to_where', default=1)
    cid = models.ForeignKey(category, models.DO_NOTHING, db_column='cid', db_comment='category', default=1)
    option = models.ForeignKey(option_list, models.DO_NOTHING, default=1)

    class Meta:
        managed = False
        db_table = 'product'


class Test(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=20)
    des = models.CharField(max_length=200)

    class Meta:
        managed = False
        db_table = 'test'


class Testforeignkey(models.Model):
    id = models.BigAutoField(primary_key=True)
    age = models.IntegerField()
    foreignkey_name = models.ForeignKey(Test, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'testforeignkey'
