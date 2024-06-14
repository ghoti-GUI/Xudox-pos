// 将全是数字的string从小到大排列
export const sortStringOfNumber = (str) => {
    return str.split('')
            .sort((a, b) => a - b)
            .join('');
}