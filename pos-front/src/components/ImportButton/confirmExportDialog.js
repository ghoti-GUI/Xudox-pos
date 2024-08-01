import React from 'react';

const ConfirmExportDialog = ({exportMode, productsData, categoriesData, handleConfirm})=>{

    
    return(
        // <div className='absolute bg-black bg-opacity-50'>
        <div className="fixed inset-0 z-10 flex items-center justify-center w-full h-screen bg-black bg-opacity-50">
            <button className='btn-red ' onClick={handleConfirm}>
                {'confirm'}
            </button>
            {/* <button className='btn-red' onClick={async()=>{await exportData(exportMode, productsData, categoriesData)}}>
                {'confirm'}
            </button> */}
        </div>
    )
}

export default ConfirmExportDialog;
