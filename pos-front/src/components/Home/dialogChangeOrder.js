import React from 'react';
import { useState, useRef, useEffect } from 'react';
import ProductCard from './productCard';
import { multiLanguageText } from '../../multiLanguageText/multiLanguageText.js';
import { Language } from '../../userInfo';

const DialogChangeOrder = ({orderedProductReceived, handleSubmit, handleCancel}) => {
    const Text = {...multiLanguageText}[Language].dialogChangeOrder;
    const [orderedProduct, setOrderedProduct] = useState(orderedProductReceived);
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);
    const dialogRef = useRef(null);

    const onDragStart = (index, cid) => {
        setDraggedItemIndex(index);
    };

    const onDragOver = (e, index, cid) => {
        e.preventDefault();

        const mouseY = e.clientY;
        const dialog = document.getElementById('container')

        const edgeThreshold = 100;
        const scrollSpeed = 5;

        if (mouseY < edgeThreshold) {
            dialog.scrollTop -= scrollSpeed; // 向上滚动
        } else if (mouseY >  window.innerHeight - edgeThreshold) {
            dialog.scrollTop += scrollSpeed; // 向下滚动
        }


        // 如果拖动的项目是同一个项目，则不进行任何操作
        if (draggedItemIndex === index ) {
            return;
        };
        

        let items = orderedProduct.filter((item, idx) => idx !== draggedItemIndex);

        // 插入被拖动的项目到新的位置
        items.splice(index, 0, orderedProduct[draggedItemIndex]);

        setOrderedProduct(items);
        setDraggedItemIndex(index);
    };

    const onDragEnd = () => {
        setDraggedItemIndex(null);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center w-full h-screen bg-black bg-opacity-50">
            <div id='container' className=" w-4/5 h-4/5 bg-white p-6 rounded shadow-lg overflow-y-auto">
                <h2 className="text-2xl mb-4">{Text.title}</h2>
                {orderedProduct.map((product, index) => {
                    return(
                        <div
                            key={product.id}
                            id={product.id}
                            draggable
                            onDragStart={() => onDragStart(index)}
                            onDragOver={(e) => onDragOver(e, index)}
                            onDragEnd={onDragEnd}
                            className=''
                        >
                            <ProductCard data={product} changeOrder={true}/>
                        </div>
                    )
                })}
                <button
                    className="right-[23%] top-[13%] px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 absolute"
                    onClick={()=>handleSubmit(orderedProduct)}
                >
                    {Text.submitButton}
                </button>
                <button
                    className="right-[14%] top-[13%] px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 absolute"
                    onClick={()=>handleCancel()}
                >
                    {Text.cancelButton}
                </button>
            </div>
        </div>
    );
}

export default DialogChangeOrder;
