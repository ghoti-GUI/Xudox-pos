// 将全是数字的string从小到大排列
export const sortStringOfNumber = (str) => {
    return str.split('')
            .sort((a, b) => a - b)
            .join('');
}

export const normalizeText = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
}