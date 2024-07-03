import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { getCsrfToken } from '../../service/token';
import { DefaultUrl, CheckIdXuExistenceUrl } from '../../service/valueDefault';
import { checkIdXuExistence, fetchAllProduct} from '../../service/product';
import { fetchAllCategory } from '../../service/category';
import { fetchPrinter } from '../../service/printer';
import { fetchTVA } from '../../service/tva';
import { multiLanguageText } from '../multiLanguageText';
import { Language } from '../../userInfo';
import { normalizeText, sortStringOfNumber } from '../utils';
import ProductCard from './productCard';



const DraggableProductCard = ({ id, product, index, moveProduct, editedProductId, state }) => {
    const ref = useRef(null);

    const [{ isDragging }, drag] = useDrag(()=>({
        type: `product${product.favourite}`,
        item: { id, index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    const [{ handlerId }, drop] = useDrop(()=>({
        accept: `product${product.favourite}`,
        // collect: (monitor) => ({
        //     handlerId: monitor.getHandlerId(),
        //   }),
        hover(item, monitor) {
            if (!ref.current) return;
            const dragIndex = item.index;
            const hoverIndex = index;

            if (dragIndex === hoverIndex) return;

            const hoverBoundingRect = ref.current.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;

            console.log('dragging...')
            console.log('dragIndex:', dragIndex)
            console.log('hoverIndex:', hoverIndex)
            console.log('hoverClientY:', hoverClientY)
            // console.log('hoverMiddleY:', hoverMiddleY) = 112.39

            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }

            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }

            

            moveProduct(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    }), [state]);

    drag(drop(ref));

    return (
        <div ref={ref} style={{ opacity: isDragging ? 0.8 : 1 }} data-handler-id={handlerId} className={`${editedProductId === product.id ? 'border-4 border-blue-500 -mx-1' : ''}`}>
            <ProductCard data={product} />
        </div>
    );
};

export default DraggableProductCard