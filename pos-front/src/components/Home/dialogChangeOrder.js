import React from 'react';
import { useState } from 'react';
import ProductCard from './productCard';

const DialogChangeOrder = ({orderedProductReceived, handleSubmit}) => {

    const [orderedProduct, setOrderedProduct] = useState(orderedProductReceived)
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);

    const onDragStart = (index, cid) => {
        setDraggedItemIndex(index);
    };

    const onDragOver = (index, cid) => {

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
            <div className=" w-4/5 h-4/5 bg-white p-6 rounded shadow-lg overflow-y-auto">
                <h2 className="text-2xl mb-4">Change product order</h2>
                {orderedProduct.map((product, index) => {
                    return(
                        <div
                            key={product.id}
                            id={product.id}
                            draggable
                            onDragStart={() => onDragStart(index)}
                            onDragOver={() => onDragOver(index)}
                            onDragEnd={onDragEnd}
                            className=''
                        >
                            <ProductCard data={product} />
                        </div>
                    )
                })}
                <button
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                    onClick={()=>handleSubmit(orderedProduct)}
                >
                Submit
                </button>
            </div>
        </div>
    );
}

export default DialogChangeOrder;
