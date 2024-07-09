# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.IntegerField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.IntegerField()
    is_active = models.IntegerField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class category(models.Model):
    ename = models.CharField(max_length=200)
    lname = models.CharField(max_length=200)
    fname = models.CharField(max_length=200)
    zname = models.CharField(max_length=200)
    name = models.CharField(max_length=200)
    extra_name = models.CharField(max_length=1000)
    edes = models.CharField(max_length=1000, null=True)
    ldes = models.CharField(max_length=1000, null=True)
    fdes = models.CharField(max_length=1000, null=True)
    des = models.CharField(max_length=1000, null=True)
    img = models.ImageField(upload_to='static/img_category/%Y/%m', null=True, blank=True)
    color = models.CharField(max_length=100, default='rgb(255, 255, 255)')
    text_color = models.CharField(max_length=100, default='rgb(0, 0, 0)')
    time_supply = models.IntegerField()
    Xu_class = models.CharField(db_column='Xu_class', max_length=200, null=True)  # Field name made lowercase.
    rid = models.IntegerField(default=0)
    category_class = models.IntegerField(default=0)
    sort_id = models.IntegerField(default=0)
    custom = models.CharField(max_length=200)
    custom1 = models.CharField(max_length=200)
    custom2 = models.CharField(max_length=200)

    class Meta:
        managed = False
        db_table = 'category'


class choice(models.Model):
    pid = models.IntegerField(db_comment='product ID')
    choicetype = models.ForeignKey('choicetype', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'choice'


class choicetype(models.Model):
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


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.PositiveSmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class option_list(models.Model):
    rid = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'option_list'


class printe_to_where(models.Model):
    printer = models.CharField(max_length=1000, db_comment='print to where list id')
    cutgroup = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'printe_to_where'


class product(models.Model):
    id_user = models.CharField(unique=True, max_length=100)
    id_Xu = models.CharField(db_column='id_Xu', max_length=100)  # Field name made lowercase.
    ename = models.CharField(max_length=200, null=True)
    lname = models.CharField(max_length=200, null=True)
    fname = models.CharField(max_length=200, null=True)
    zname = models.CharField(max_length=200, null=True)
    online_content = models.CharField(max_length=200, null=True)
    bill_content = models.CharField(max_length=100)
    kitchen_content = models.CharField(max_length=200)
    extra_name = models.CharField(max_length=1000, null=True)
    edes = models.CharField(max_length=1000, null=True)
    ldes = models.CharField(max_length=1000, null=True)
    fdes = models.CharField(max_length=1000, null=True)
    online_des = models.CharField(max_length=1000, null=True)
    allergen = models.CharField(max_length=1000, null=True)
    discount = models.CharField(max_length=200, null=True)
    img = models.ImageField(upload_to='static/img_product/%Y/%m', null=True, blank=True)
    color = models.CharField(max_length=100, default='rgb(255, 255, 255)')
    text_color = models.CharField(max_length=100, default='rgb(0, 0, 0)')
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    price2 = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    price_extra = models.CharField(max_length=2000, null=True)
    extra_TVA = models.DecimalField(db_column='extra_TVA', max_digits=8, decimal_places=2, default=0)  # Field name made lowercase.
    time_supply = models.IntegerField(db_comment='1:lunch,2:dinner,12:allday', default=0)
    product_type = models.IntegerField(db_comment='product/set/option', default=0)
    soldout = models.IntegerField(default=0)
    min_nbr = models.IntegerField(db_comment='minimum purchase nbr', default=1)
    rid = models.IntegerField(db_comment='restaurant id', default=0)
    stb = models.IntegerField(db_comment='sushi to bar', null=True)
    position = models.IntegerField(default=0)
    favourite = models.IntegerField(default=0)
    follow_id = models.IntegerField(default=0)
    extra_id = models.IntegerField(default=0)
    Xu_class = models.CharField(db_column='Xu_class', max_length=200, null=True)  # Field name made lowercase.
    custom = models.CharField(max_length=200, db_comment='customisation', null=True)
    custom2 = models.CharField(max_length=200, db_comment='customisation 2', null=True)
    custom3 = models.CharField(max_length=200, null=True)
    custom4 = models.CharField(max_length=200, null=True)
    custom5 = models.CharField(max_length=200, null=True)
    # print_to_where = models.ForeignKey(printe_to_where, models.DO_NOTHING, db_column='print_to_where', default=1)
    print_to_where = models.IntegerField(db_column='print_to_where', default=1)
    cid = models.ForeignKey(category, models.DO_NOTHING, db_column='cid', db_comment='category', default=1)
    option = models.ForeignKey(option_list, models.DO_NOTHING, default=1)
    TVA_id = models.ForeignKey('tva', models.DO_NOTHING, db_column='TVA_id', default=1)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'product'
        unique_together = (('id_Xu', 'rid'),)


class Test(models.Model):
    name = models.CharField(max_length=20)
    des = models.CharField(max_length=200)

    class Meta:
        managed = False
        db_table = 'test'


class Testforeignkey(models.Model):
    age = models.IntegerField()
    foreignkey_name = models.ForeignKey(Test, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'testforeignkey'

class TestImg(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    image = models.ImageField(upload_to='static/test_images/%Y/%m', null=True, blank=True)

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'testimg'


class tva(models.Model):
    countryEnglish = models.CharField(max_length=100)
    countryChinese = models.CharField(max_length=100)
    countryFrench = models.CharField(max_length=100)
    countryDutch = models.CharField(max_length=100)
    category = models.IntegerField()
    tva_value = models.DecimalField(max_digits=8, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'tva'
        unique_together = (('countryEnglish', 'countryChinese', 'countryFrench', 'countryDutch', 'category'),)



