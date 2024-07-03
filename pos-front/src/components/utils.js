// 将全是数字的string从小到大排列
export const sortStringOfNumber = (str) => {
    return str.split('')
            .sort((a, b) => a - b)
            .join('');
}

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

export const updateCheckboxData = (fetchedData, checkboxData) =>{
    let returnData = fetchedData
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
    let objUpdateCopy = objUpdate;
    for(const key in objUpdate){
        if(Object.keys(objSource).includes(key)){
            objUpdateCopy[key]=objSource[key];
        }
    }
    return objUpdateCopy
}