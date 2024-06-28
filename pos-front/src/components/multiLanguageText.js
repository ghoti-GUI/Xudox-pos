
const notesUnderID = {
    'English':[
        'ID can be entered up to <b>three digits</b> in <b>letters</b>, <b>numbers</b> and <b>symbls other than "."</b>', 
        'Letters with accents marks will be converted to nomal'
    ],
    'Chinese':[
        'ID最多可以输入<b>三位字符</b>，可输入<b>英文</b>、<b>数字</b>和<b>除了“.”以外的标点符号</b>',
        '带重音符号的字母会被转换成一般字母'
    ]
}

const TimeSupplyData = {
    'English':{
        'lunch': true,
        'dinner': true,
    },
    'Chinese':{
        '午餐': true,
        '晚餐': true,
    }
}




export const multiLanguageText = {
    'English':{
        'country':{
            'Belgium':'Belgium',
            'French':'French', 
        }, 
        'product':{
            // 'id_Xu':['ID', 'Enter your product\'s ID', 'ID can be entered up to <b>&nbsp three digits &nbsp</b> in <b>&nbsp letters &nbsp</b> and <b>&nbsp numbers &nbsp</b>'],
            'id_Xu':['ID', 'Enter your product\'s ID', 'ID already existed', notesUnderID.English],
            'notesForPrintContent':['You can enter up to <b>25 characters</b> for the two contents below'], 
            'bill_content':['Bill content', 'Enter the content shown on the bill'],
            'kitchen_content':['Kitchen content', 'Enter the content to send to the kitchen'],
            'price':['Price', 'Enter the price for eat in'],
            'price2':['Price for takeaway', 'Enter the price for takeaway'],
            'TVA_country':['Country', 'Select your country here'],
            'TVA_category':['TVA'],
            'cid':['Category', 'Select the category of this product'],
            'time_supply':['Supply time', {
                'lunch': true,
                'dinner': true,
            }, 'Please choose at least one supply time'],
            'print_to_where':['Printers selected','','Please select at least one printer'], 
            'addSuccess':'Product added successfully', 
            'addFailed':'Product added failed', 
            'advanceButton':'Advance settings', 
            'returnNormalButton':'Return to normal settings', 
        },
        'productAdvance':{
            'id_user':['ID without restrictions', 'ID without any restrictions'],
            'online_content':['Online content', 'Enter the content shown in the online application'],
            'online_des':['Online description', 'Enter the description shown online'], 
            'product_type':['Type',{
                'Product':0,
                'Option':1,
            }],
            'min_nbr':['Minimum number of purchase','The minimum number of products purchased by the user when the user selects a product to purchase'],
            'discount':['Discount', ['None', 'Buy 1 Get 1 Free','Fixed reduction', 'Percentage reduction']], 
            'allergen':['Allergen'], 
            'ename':['English name', 'Enter the name in English'],
            'lname':['Dutch name', 'Enter the name in Dutch'], 
            'fname':['French name', 'Enter the name in French'], 
            'zname':['Chinese name', 'Enter the name in Chinese'], 
            'edes':['English description', 'Enter the description in English'],
            'ldes':['Dutch description', 'Enter the description in Dutch'],
            'fdes':['French description', 'Enter the description in French'],
            'stb':['Sushi to bar'],
            'favourite':['Favourite'],
        },
        'category':{
            'id':['ID', 'Enter the ID of your new category', 'ID already existed', notesUnderID.English],
            'name':['Name', 'Enter the name of your new category'],
            'des':['Description', 'Enter the description of your new category'],
            'time_supply':['Supply time', TimeSupplyData.English, 'Please choose at least one supply time'], 
            'addSuccess':'Category added successfully', 
            'addFailed':'Category added failed', 
        }, 
        'img':['Choose image for your product', 'Change image'], 
        'color':'Choose background color: ', 
        'text_color':['Automatic setting for text colours', ['Black', 'white']],
        'home':{
            'id':['ID'],
            'online_content':['Online content'],
            'bill_content':['Bill content'],
            'kitchen_content':['Kitchen content'],
            'online_des':['Bill description'], 
            'price':['Price'],
            'price2':['Price for takeaway'],
            'TVA':['TVA'],
            'product_type':['Type'],
            'cid':['Category'],
            'time_supply':['Supply time', ['Lunch', 'Dinner', 'Whole day']],
            'print_to_where':['Printers selected'], 
            'soldout':['Sold out']
        },
        'check':{
            'pageName':'Check Page', 
            'img':'Your choosed image: ',
            'editButton':'Edit',
        },
        'edit':{
            'pageName':'Edit Page',
        }, 
        'add':{
            'pageName':'Add Page'
        }
    },
    'Chinese':{
        'country':{
            'Belgium':'比利时',
            'French':'比利时', 
        }, 
        'product':{
            'id_Xu':['ID', '输入产品ID', 'ID已存在', notesUnderID.Chinese],
            'online_content':['在线名字', '输入显示在 “在线应用” 中的名字'],
            'notesForPrintContent':['您可以在下面两个输入框中输入<b>最多25个字符（12个中文）</b>'], 
            'bill_content':['账单内容', '输入显示在 “账单” 中的内容'],
            'kitchen_content':['厨房内容', '输入发送给 “厨房” 的内容'],
            'online_des':['在线描述', '输入显示在 “在线应用” 中的描述'], 
            'price':['价格', '输入堂食价格'],
            'price2':['外卖价格', '输入外卖价格'],
            'TVA_country':['国家', '选择您所在的国家'],
            'TVA_category':['TVA（税）'],
            'product_type':['类型',{
                '商品':0,
                '选项':1,
              }],
            'cid':['产品类别', '选择产品类别'],
            'time_supply':['供应时间', TimeSupplyData.Chinese, '请选择至少一个供应时间'],
            'print_to_where':['打印机选择','','请选择至少一个打印机'], 
            'addSuccess':'产品添加成功', 
            'addFailed':'产品添加失败', 
            'advanceButton':'高级设置', 
            'returnNormalButton':'返回一般设置', 
            'allergen':['过敏原'], 
            'discount':['折扣', ['无', '买一送一','固定降价', '百分比降价']], //database: 'b1g1f', '-10', '-10%'
        },
        'category':{
            'id':['ID', '输入类别ID', 'ID已存在', notesUnderID.Chinese],
            'name':['类别名字', '输入新的类别名字'],
            'des':['类别描述', '输入对新的类别的描述'],
            'time_supply':['供应时间', TimeSupplyData.Chinese, '请选择至少一个供应时间'], 
            'addSuccess':'类别添加成功', 
            'addFailed':'类别添加失败', 
        }, 
        'img':['选择产品的图片', '更改图片'], 
        'color':'选择背景颜色: ', 
        'text_color':['自动设置字体颜色', ['黑色', '白色']], 
        'home':{
            'id':['ID'],
            'online_content':['在线内容'],
            'bill_content':['账单内容'],
            'kitchen_content':['厨房内容'],
            'online_des':['账单描述'], 
            'price':['价格'],
            'price2':['外卖价格'],
            'TVA':['TVA'],
            'product_type':['类型'],
            'cid':['产品种类'],
            'time_supply':['供应时间',['午餐', '晚餐', '全天']],
            'print_to_where':['打印机选择'], 
            'soldout':['售完'], 
        },
        'check':{
            'pageName':'查看页面', 
            'img':'选择的图片：',
            'editButton':'编辑',
        },
        'edit':{
            'pageName':'编辑页面',
        }, 
        'add':{
            'pageName':'新增页面'
        },
    },
}


export const multiLanguageAllergen = {
    'English':[
        'Cereals container of gluten', 
        'Crustaceans products', 
        'Eggs products', 
        'Peanuts products', 
        'Fish products', 
        'Soybean and soya products', 
        'Milk products (including lactose)', 
        'Nuts and products thereof', 
        'Celery products', 
        'Mustard products', 
        'Sesame and sesame products', 
        'Sulfur dioxide and sulphites in concentrations of more than 10 mg/kg or 10 mg/L',
        'Lupin products', 
        'Molluscs products', 
    ], 
    'Chinese':[
        '含有麸质的谷物', 
        '甲壳动物产品', 
        '蛋类产品', 
        '花生类产品', 
        '鱼类产品', 
        '大豆制品', 
        '奶制品（包括乳糖）', 
        '坚果及其制品', 
        '芹菜制品', 
        '芥末产品', 
        '芝麻制品', 
        '二氧化硫和亚硫酸盐浓度超过 10 毫克/千克或 10 毫克/升', 
        '羽扇豆产品',
        '软体动物产品', 
    ]
}