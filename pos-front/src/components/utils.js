// 将全是数字的string从小到大排列
export const sortStringOfNumber = (str) => {
    return str.split('')
            .sort((a, b) => a - b)
            .join('');
}


// 去掉所有重音符号和点
export const normalizeText = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f.]/g, "");
}

// export const mergeObject = (objectMerged, objectMain)=>{
//     const objectFinal = objectMain
//     if(objectMain){
//         for (const key in objectMerged){
//             if( !objectMain.hasOwnProperty(key)){
//                 objectFinal[key]=objectMerged[key]
//             }
//         }
//         return(objectFinal)
//     }
//     return objectMerged
// }


// fetchedData = checkbox的结构
// printer：{'id':id, 'printer':printer, 'checked':false}
// allergen：{'allergen':allergen, 'checked':false}
// checkboxData = 数据，例如：12（printer）， 'Cereals, Crustaceans'（allergen）
export const updateCheckboxData = (fetchedData, checkboxData) =>{
    let returnData = {...fetchedData}
    if(Object.keys(fetchedData[0]).includes('printer')){
        const printers = String(checkboxData).split('')
        returnData = fetchedData.map((printer)=>{
            if(printers.includes(printer.id)){
                return {...printer, 'checked':true}
            }
            return printer
        })
    }else if(Object.keys(fetchedData[0]).includes('allergen')){
        const allergens = checkboxData.split(',');
        console.log('allergens:', allergens)
        returnData = fetchedData.map((allergen)=>{
            if(allergens.includes(allergen.allergen)){
                return {...allergen, 'checked':true}
            }
            return allergen
        })
    }
    return returnData
}

export const updateObject = (objUpdate, objSource)=>{
    let objUpdateCopy = {...objUpdate};
    for(const key in objUpdate){
        if(Object.keys(objSource).includes(key)){
            objUpdateCopy[key]=objSource[key];
        }
    }
    return objUpdateCopy
}


export const truncateString = (string, maxLength)=>{
    let length = 0;
    let result = '';
    let exceed = false;
    for (let i = 0; i < string.length; i++) {
        if (string.charCodeAt(i) > 127) {
            length += 2;
        } else {
            length += 1;
        }

        if (length > maxLength) {
            exceed = true
            break;
        }

        result += string[i];
    }

    return [result, exceed]
}