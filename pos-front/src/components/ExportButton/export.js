import { fetchAllProduct } from "../../service/product";
import { fetchAllCategory } from "../../service/category";



// const fs = require('fs')
// const path = require('path');

// const directoryPath = 'D:/work/Stage fr/XudoX.be/testAB';
// const fileName = 'AB1.txt';

// const filePath = path.join(directoryPath, fileName);

const formatProductData = (product) => {
    const id_Xu = product.id.toString().padStart(3, ' ');
    const bill_content = product.bill_content.padEnd(25, ' ');
    const price = product.price;
    return `${id_Xu} ${bill_content} ${price}`;
};

const formatCategoryData = (category) => {
    const cid = category.id.toString();
    const name = category.name;
    return `ab${cid}.txt ${name}`;
};

export const handleClickExport = async()=>{
    const products = await fetchAllProduct();
    const categories = await fetchAllCategory();

    const product_category = [];

    const formattedDataProduct = products.map(formatProductData).join('\n');
    const blob_product = new Blob([formattedDataProduct], { type: 'text/plain;charset=utf-8' });
    const url_product = URL.createObjectURL(blob_product);

    const a_product = document.createElement('a_product');
    a_product.href = url_product;
    a_product.download = 'abx.txt';
    document.body.appendChild(a_product);
    a_product.click();

    setTimeout(() => {
        document.body.removeChild(a_product);
        URL.revokeObjectURL(url_product);
    }, 0);



    const formattedDataCategory = categories.map(formatCategoryData).join('\n');
    const blob_category = new Blob([formattedDataCategory], { type: 'text/plain;charset=utf-8' });
    const url_category = URL.createObjectURL(blob_category);

    const a_category = document.createElement('a_category');
    a_category.href = url_category;
    a_category.download = 'HooftName.txt';
    document.body.appendChild(a_category);
    a_category.click();

    setTimeout(() => {
        document.body.removeChild(a_category);
        URL.revokeObjectURL(url_category);
    }, 0);
    
}


