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

export const handleClickExport = async()=>{
    const products = await fetchAllProduct()
    const categories = await fetchAllCategory()

    const formattedData = products.map(formatProductData).join('\n');
    const blob = new Blob([formattedData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.txt';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
    
}


