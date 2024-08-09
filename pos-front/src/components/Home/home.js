import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchAllProductFrontForm, updateProduct} from '../../service/product';
import { fetchAllCategory } from '../../service/category';
import { multiLanguageText } from '../../multiLanguageText/multiLanguageText.js';
import { UserContext  } from '../../userInfo';
import ProductCard from './productCard';
import DialogChangeOrder from './dialogChangeOrder';
import { toast } from 'react-toastify';
import { ReactComponent as Detail } from '../../img/detail.svg';
import { ReactComponent as Edit } from '../../img/edit.svg';


function Home() {
    const navigate = useNavigate();
    const { RestaurantID } = useContext(UserContext);
    const { Language } = useContext(UserContext);
    const Text = {...multiLanguageText}[Language].home;
    const location = useLocation();
    const editedProductId = location.state?.editedProductId;
    const editedCategoryId = location.state?.editedCategoryId;
    const dinein_takeaway_recv = location.state?.dinein_takeaway; // 1=dine-in, 2=takeaway
    const [DineinTakeaway, setDineinTakeaway] = useState(dinein_takeaway_recv||1); // 1=dine-in, 2=takeaway
    const [categories, setCategories] = useState({});
    const [productsClassified, setProductsClassified] = useState({
        // 'categoryId-1':[
        //     {'id':1, 'bill_content':'laziji', ...},
        //     {'id':2, 'bill_content':'doufu', ...},
        // ],
        // 'categoryId-2':[]
    });

    useEffect(() => {
        const fetchData = async ()=>{
            // fetch all product and category data
            const products_data = await fetchAllProductFrontForm(RestaurantID);
            const categories_data = await fetchAllCategory(RestaurantID);
            const productClassifiedCopy = {...productsClassified};

            // classify all product data to each category
            if(categories_data && categories_data.length > 0){
                for(const category of categories_data){
                    productClassifiedCopy[category.id]=[];
                };
            }
            if(products_data && products_data.length > 0){
                for (const product of products_data){
                    productClassifiedCopy[product.cid].push(product);
                };
            }

            // sort product in each category
            Object.values(productClassifiedCopy).forEach(value=>{
                return value.sort((a, b) => {
                    if (a.favourite === b.favourite) {
                    // 如果 favourite 相同，则按 position 排序
                        return a.position - b.position;
                    }
                    // 否则按 favourite 排序
                    return b.favourite - a.favourite;
                });
            });
            setProductsClassified(productClassifiedCopy)
            setCategories(categories_data);

            // when return from edit/check page scroll to product edited/checked
            const getEle = document.getElementById(editedProductId);
            if (getEle) {
                getEle.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            const getEleCategory = document.getElementById(editedCategoryId);
            if (getEleCategory) {
                getEleCategory.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        };fetchData();
        
    },[editedProductId]);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dataToDialog, setDataToDialog] = useState(null);
    const openDialog = (cid) => {
        setDataToDialog(productsClassified[cid])
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
    };

    // function to submit position
    const handleSubmitPosition = async(orderedProductFromDialog) => {
        const cid = orderedProductFromDialog[0].cid;
        const productsClassifiedCopy = productsClassified;
        productsClassifiedCopy[cid]=orderedProductFromDialog;
        setProductsClassified(productsClassifiedCopy);
        for (let i=0;i<orderedProductFromDialog.length; i++){
            const positionData = {'id':orderedProductFromDialog[i].id, 'position':i, 'rid':RestaurantID}

            const updated = await updateProduct(positionData)
            if(updated.success){
                toast.success(Text.addSuccess);
            }else{
                toast.error(Text.addFailed)
            }
        }

        closeDialog();
    };

    const handleClickDetail = (category)=>{
        navigate(
            `../checkCategory/${category.id}`, 
            {state:{category:category, 'type':'check'}}
        )
    }

    const handleClickEdit = (category)=>{
        navigate(
            `../editCategory/${category.id}`, 
            {state:{category:category, 'type':'edit'}}
        )
    }


    return(
        <div className='flex flex-col h-screen overflow-y-hidden'>
            <span className='my-3 ml-5 font-sans text-4xl font-bold text-gray-800'>{Text.title}</span> 
            <div className='grid grid-cols-3 items-center ml-5 '>
                <span className=' col-span-1 font-sans text-2xl font-bold text-gray-800'>
                    {DineinTakeaway===1?Text.DineinMenu:Text.TakeawayMenu}
                </span>
                <div className=' col-span-1'>
                    <button
                        className={`ml-3 h-8 px-3 text-sm text-white rounded-lg ${DineinTakeaway===1?'bg-buttonBleu':'bg-buttonGray'}`}
                        onClick={()=>setDineinTakeaway(1)}>
                        {Text.DineinMenuButton}
                    </button>
                    <button 
                        className={`ml-3 h-8 px-3 text-sm text-white rounded-lg ${DineinTakeaway===2?'bg-buttonBleu':'bg-buttonGray'}`}
                        onClick={()=>setDineinTakeaway(2)}>
                        {Text.TakeawayMenuButton}
                    </button>
                </div>
            </div>
            <div className='ml-5 max-h-screen overflow-y-auto overflow-x-hidden pr-5'>
                {Object.values(categories).map((category,index)=>{
                    return(
                    <div 
                        key={category.id} id={category.id} 
                        className={` relative flex flex-col justify-center px-3 pt-2 my-3 w-full rounded-lg ${category.id===editedCategoryId?`ml-0 border-l-4 border-blue-500 -mx-1`:``}`} 
                        style={{backgroundColor: category.color, color:category.text_color}}>
                        <button 
                            onClick={() => openDialog(category.id)} 
                            className=' absolute right-5 top-1 px-4 py-1 bg-buttonBleu hover:bg-buttonBleuHover text-white rounded '>
                            {Text.modifyOrder}
                        </button>
                        <div className='flex flex-row '>
                            <span className='font-sans text-xl font-bold'>{category.name || category.ename || category.lname || category.fname || category.zname }</span>
                            <button onClick={()=>handleClickDetail(category)} className='flex items-center pl-1 w-8 h-7 -mb-3 mx-2 border-l-2 border-black'>
                                <Detail className='w-full'/>
                            </button>
                            <button onClick={()=>handleClickEdit(category)} className='flex items-center pl-1 w-8 h-7 -mb-3 border-l-2 border-black'>
                                <Edit className='w-full'/>
                            </button>
                        </div>
                        <span className='text-sm mb-1'>{category.edes || category.ldes || category.fdes || category.zdes || category.des}</span>
                        <div className='mx-2'>
                            {productsClassified[category.id].map((product, index) => {
                                if(product.dinein_takeaway===DineinTakeaway){
                                    return(
                                        <div key={product.id} id={product.id} className={product.id===editedProductId?`border-4 border-blue-500 -mx-1`:``}>
                                            <ProductCard data={product} />
                                        </div>
                                    )
                                }
                                return(<></>)
                            })}
                        </div>
                        <br/>
                    </div>)
                })}

                {isDialogOpen && 
                    <DialogChangeOrder 
                        orderedProductReceived={dataToDialog} 
                        handleSubmit={handleSubmitPosition}
                        handleCancel={closeDialog}
                        DineinTakeaway={DineinTakeaway}
                    />
                }
            </div>
        </div>
    )
}

export default Home