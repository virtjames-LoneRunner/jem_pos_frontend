// import logo from './logo.svg';clear
import './App.css';
import { useEffect, useState } from 'react';

function App() {
  const BASE_URL = 'http://192.168.1.3:5000'
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const [action, setAction] = useState("add")

  const defaultEditData = {
    div_id: '',

    barcode: '',
    product_code: '',
    description: '',
    stock: 0,
    reorderStock: 1,
    delivered_by: '',
    remarks: '',

    product_category: '',
    unit: '',
    wholesale_price: 0,
    retail_price: 0,
    has_pack: false,
    pack_price: 0,
    pack_quantity: 0,
  }
  const [editData, setEditData] = useState(defaultEditData);

  const [searchTerm, setSearchTerm] = useState('')
  const handleSearchInput = (e) => {
    setSearchTerm(e.target.value);
  }
  const handleFormInput = (e) => {
    // console.log(e.target.name, e.target.value);
    setEditData({...editData,
      [e.target.name]: e.target.value
    })
  }
  const handleFormCheckbox = (e) => {
    setEditData({...editData,
      [e.target.name]: !editData.has_pack
    })
  }
  useEffect(() => {
    if (!searchTerm) {
      setProducts([])
      return
    };
    setProducts([])
    const timeOutId = setTimeout(() => fetchProducts(searchTerm), 800);
    return () => clearTimeout(timeOutId);
  }, [searchTerm])

  const fetchProducts = (search) => {
    fetch(BASE_URL + `/search-products?search=${search}`).then((res) => {
      if (res.status === 200) {
        res.json().then((data) => {
          // console.log(data);
          setProducts(data.products);
        })
      }
    })
  }
  const handleSelectProduct = (e) => {
    setAction('add')
    setModalOpen(true);
    let index = parseInt(e.target.dataset.index);
    setEditData({...products[index], 
      delivered_by: '',
      remarks: '',
      stock: 0,
      stock_to_trash: 0,
      div_id: `id-${index}`
    });
  }
  const handleFormSubmit = (e) => {
    e.preventDefault()
    let action = e.target.action.value
    fetch(BASE_URL + `/${action}-stock`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(editData),
    }).then((res) => {
      if (res.status === 200) {
        fetchProducts(searchTerm)
        // setEditData(defaultEditData)
      }
    }).catch((err) => {
      alert(err.message)
    })
    setModalOpen(false)
    e.target.reset()
  }

  const handleAddProduct = (e) => {
    e.preventDefault()

    fetch(BASE_URL + `/add-product`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(editData),
    }).then((res) => {
      if (res.status === 200) {
        setEditData(defaultEditData); 
        setAddModalOpen(false)
        setEditData(defaultEditData)
        e.target.reset()
        alert("Product added successfully")
        document.location.reload()
      }
    }).catch((err) => {
      alert(err.message)
    })

  }

  // useEffect(() => {
  //   if (!modalOpen) {
  //     fetchProducts(searchTerm);
  //   }
  // }, [modalOpen])

  return (
    <div className="App relative">
      <header className='py-2 px-5 text-lg border-b-2 bg-gray-100 fixed top-0 w-full z-10 flex justify-evenly items-center'>
        <div className='w-1/3'></div>
        <div className='w-1/3'>POS Mobile</div>
        <div className='w-1/3 flex justify-end'>
          <button type="button" className='add-product' onClick={() => {setAddModalOpen(true); setEditData(defaultEditData)}}>Products</button>
        </div>
      </header> 
      <main className='h-screen fixed bg-gray-50 py-16 flex flex-col items-center w-full mt-5 px-5'>
        <div className='mb-4 flex flex-col items-center w-full'>
          <label htmlFor="" className='text-left w-full font-semibold'>Search: [Barcode | Product]</label>
          <input type="text" className='w-full h-12 border border-blue-500 px-4 rounded-md' value={searchTerm} onChange={handleSearchInput}/> 
        </div>
        <div className='w-full overflow-y-auto border p-2 rounded shadow-inner bg-gray-100/80'>
          {(products.length > 0) ? products.map((product, index) => (
            <div
            onClick={handleSelectProduct}
            data-index={index}
            key={index}
            id={`id-${product.id}`}
            className={`${editData.div_id === `id-${index}` ? 'bg-blue-500 text-white' : 'hover:bg-blue-50 bg-white'} product-item border border-gray-200 shadow rounded-md p-4 mb-1 hover:cursor-pointer`}>
              <div>
                  <div className='text-left'>
                    <h2>
                      <span className='font-semibold'>Product Name: </span>
                      {product.product_desc}</h2>
                  </div>
              </div>
              <div className='flex justify-between'>
                <div className='flex flex-col justify-start'>
                  <div className='text-left'>
                    <h2>
                      <span className='font-semibold'>Barcode: </span>
                      {product.product_code}</h2>
                  </div>
                  <div className='flex'>
                    <h2>
                      <span className='font-semibold'>Remaining Stocks: </span>
                      {product.stock}</h2>
                  </div>
                </div>
                <div className='flex flex-col justify-start'>
                  <div className='text-left'>
                    <h2>
                      <span className='font-semibold'>Retail Price: </span>
                      {product.product_price}</h2>
                  </div>
                  <div className='text-left'>
                    <h2>
                      <span className='font-semibold'>Wholesale Price: </span>
                      {product.product_ws_price}</h2>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className='product-item border border-gray-200 shadow rounded-md p-4 mb-1 bg-white'>
              No Item Available
            </div>
          )}
        </div>
      </main>
      <div className={`${modalOpen ? '' : 'hidden'} fixed z-20 top-0 left-0 h-screen w-full flex justify-center items-center bg-gray-400/70`}>
        <form autoComplete="off" onSubmit={handleFormSubmit} className={`w-3/4 shadow-lg border py-5 px-5 bg-white rounded-lg`}>
            <div className='flex justify-between items-center'>
              <h1 className='text-lg font-semibold'>{`${action === 'add' ? 'Add' : 'Trash'}`} Stock</h1>
              <button onClick={() => {setModalOpen(false)}} className='bg-red-600 hover:bg-red-800 text-white p-2 rounded-md' type="button">Close</button>
            </div>
            <div className='flex border-b mb-2 pb-2 space-x-1 action-toggle'>
              <button onClick={() => setAction('add')} className={`${action === 'add' ? 'active' : ''}`} type='button'>Add Stock</button>
              <button onClick={() => setAction('trash')} className={`${action === 'trash' ? 'active' : ''}`} type='button'>Trash Stock</button>
            </div>
            <div className='mb-5 space-y-1'>
              <div className='text-left'>
                <label htmlFor="">Product Code</label>
                <input className='border p-2 w-full rounded' type="text" name="product_code" defaultValue={editData.product_code} disabled/>
              </div>
              <div className='text-left'>
                <label htmlFor="">Description</label>
                <input className='border p-2 w-full rounded' type="text" name="product_desc" defaultValue={editData.product_desc} disabled/>
              </div>
              {action === 'add' ? (
                <div>
                  <div className='text-left'>
                    <label htmlFor="">Stock to add <span className='text-sm text-gray-600'>(Required)</span></label>
                    <input value={editData.stock} onChange={handleFormInput} className='border p-2 w-full rounded' type="number" name="stock" />
                  </div>
                  <div className='text-left'>
                    <label htmlFor="">Delivered By <span className='text-sm text-gray-600'>(Required)</span></label>
                    <input value={editData.delivered_by} onChange={handleFormInput} className='border p-2 w-full rounded' type="text" name="delivered_by" />
                  </div>
                  <div className='text-left'>
                    <label htmlFor="">Remarks</label>
                    <input value={editData.remarks} onChange={handleFormInput} className='border p-2 w-full rounded' type="text" name="remarks" />
                  </div>
                </div>
              ) : (
                <div>
                  <div className='text-left'>
                    <label htmlFor="">Stock to Trash <span className='text-sm text-gray-600'>(Required)</span></label>
                    <input value={editData.stock_to_trash} onChange={handleFormInput} className='border p-2 w-full rounded' type="number" name="stock_to_trash" />
                  </div>
                  <div className='text-left'>
                    <label htmlFor="">Reason <span className='text-sm text-gray-600'>(Required)</span></label>
                    <input value={editData.remarks} onChange={handleFormInput} className='border p-2 w-full rounded' type="text" name="remarks" />
                  </div>
                </div>
              )}
            </div>
            <input type="hidden" name="action" value={action} />
            <div>
              <button type="submit" className={`${action}-stock text-white px-2 py-4 w-full rounded-md`}>{`${action === 'add' ? 'Add' : 'Trash'}`} Stock</button>
            </div>
        </form>
      </div>
      
      {/* ADD PRODUCT MODAL */}
      <div className={`${addModalOpen ? '' : 'hidden'} fixed z-20 top-0 left-0 h-screen w-full flex justify-center items-center bg-gray-400/70`}>
        <form autoComplete='off' onSubmit={handleAddProduct} className={`w-3/4 shadow-lg border py-5 px-5 bg-white rounded-lg`}>
            <div className='flex justify-between items-center'>
              <h1 className='text-lg font-semibold'>Add Product</h1>
              <button onClick={() => {setAddModalOpen(false); setEditData(defaultEditData)}} className='bg-red-600 hover:bg-red-800 text-white p-2 rounded-md' type="button">Close</button>
            </div>
            <div className='mb-5 space-y-1'>
              <div className='text-left'>
                <label htmlFor="">Product Code</label>
                <input onChange={handleFormInput} className='border p-2 w-full rounded' type="text" name="product_code" value={editData.product_code}/>
              </div>
              <div className='text-left'>
                <label htmlFor="">Description</label>
                <input onChange={handleFormInput} className='border p-2 w-full rounded' type="text" name="description" value={editData.description}/>
              </div>
              <div>
                <div className='text-left'>
                  <label htmlFor="">Unit</label>
                  <input value={editData.unit} onChange={handleFormInput} className='border p-2 w-full rounded' type="text" name="unit" />
                </div>
                <div className='text-left'>
                  <label htmlFor="">Wholesale Price</label>
                  <input value={editData.wholesale_price} onChange={handleFormInput} className='border p-2 w-full rounded' type="number" name="wholesale_price" /> </div>
                <div className='text-left'>
                  <label htmlFor="">Retail Price</label>
                  <input value={editData.retail_price} onChange={handleFormInput} className='border p-2 w-full rounded' type="number" name="retail_price" />
                </div>
                <div className='text-left'>
                  <label htmlFor="">Category</label>
                  <select value={editData.product_category} onChange={handleFormInput} className='border p-2 w-full rounded' type="number" name="product_category">
                    <option value="" disabled>Select Category</option>
                    <option value="Grocery">Grocery</option>
                    <option value="Liquors">Liquors</option>
                    <option value="Ice Cream">Ice Cream</option>
                    <option value="Cigarette">Cigarette</option>
                  </select>
                </div>
                <div className='flex items-center space-x-2 mt-5 mb-4'>
                  <label htmlFor="">Has Pack?</label>
                  <input checked={editData.has_pack} onChange={handleFormCheckbox} className='h-5 w-5' type="checkbox" name="has_pack" />
                </div>
                <div className='text-left'>
                  <label htmlFor="">Pack Price</label>
                  <input value={editData.pack_price} disabled={!editData.has_pack} onChange={handleFormInput} className='border p-2 w-full rounded' type="number" name="pack_price" />
                </div>
                <div className='text-left'>
                  <label htmlFor="">Pack Quantity</label>
                  <input value={editData.pack_quantity} disabled={!editData.has_pack} onChange={handleFormInput} className='border p-2 w-full rounded' type="number" name="pack_quantity" />
                </div>
              </div>
            </div>
            <div>
              <button type="submit" className={`add-stock text-white px-2 py-4 w-full rounded-md`}>Add Product</button>
            </div>
        </form>
      </div>
    </div>
  );
}

export default App;
