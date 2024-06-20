export const multiLanguageText = {
    'English':{
        'product':{
            // 'id_Xu':['ID', 'Enter your product\'s ID', 'ID can be entered up to <b>&nbsp three digits &nbsp</b> in <b>&nbsp letters &nbsp</b> and <b>&nbsp numbers &nbsp</b>'],
            'id_Xu':['ID', 'Enter your product\'s ID', 'ID already existed', ['ID can be entered up to <b>three digits</b> in <b>letters</b> and <b>numbers</b> <br/>', 'Letters with accents marks will be converted to nomal']],
            'online_content':['Online content', 'Enter the name shown in the online application'],
            'bill_content':['Bill content', 'Enter the name shown on the bill'],
            'kitchen_content':['Kitchen content', 'Enter the name to send to the kitchen'],
            'bill_des':['Bill description', 'Enter the description shown on the bill'], 
            'price':['Price'],
            'price2':['Price for takeaway'],
            'TVA_country':['Country', 'Select your country here'],
            'TVA_category':['TVA'],
            'product_type':['Type',{
                'Product':0,
                'Option':1,
              }],
            'cid':['Category', 'Select the category of this product'],
            'time_supply':['Supply time', {
                'lunch': true,
                'dinner': true,
              }, 'Please choose at least one supply time'],
            'print_to_where':['Printers selected','','Please select at least one printer'], 
        }
    },
    'Chinese':{
        'product':{
            'id_Xu':['ID', '输入产品ID', 'ID已存在', ['ID最多可以输入<b>三位字符</b>，可输入<b>英文</b>和<b>数字</b>','']],
            'online_content':['在线名字', '输入显示在 “在线应用” 中的名字'],
            'bill_content':['账单名字', '输入显示在 “账单” 中的名字'],
            'kitchen_content':['厨房名字', '输入发送给 “厨房” 的名字'],
            'bill_des':['账单描述', '输入显示在 “账单” 中的描述'], 
            'price':['价格'],
            'price2':['外卖价格'],
            'TVA_country':['国家', '选择您所在的国家'],
            'TVA_category':['TVA（税）'],
            'product_type':['类型',{
                '商品':0,
                '选项':1,
              }],
            'cid':['产品种类', '选择产品种类'],
            'time_supply':['供应时间', {
                '午餐': true,
                '晚餐': true,
              }, '请选择至少一个供应时间'],
            'print_to_where':['打印机选择','','请选择至少一个打印机'], 
        }
    }
    

}