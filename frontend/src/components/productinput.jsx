import React from 'react';

export default function ProductInput({ product, onChange, onRemove, categories, subcategories, handleCategoryChange, currencies, currency, setCurrency, level = 1 }) {
  const indentStyle = {
    paddingLeft: `${level * 20}px`, // Adjust indentation based on level
    borderLeft: `${level > 0 ? '2px solid #E5E7EB' : 'none'}`, // Indentation border for subproducts
  };

  return (
    <div className="border p-4 mb-4 rounded-lg shadow-sm bg-gray-50" style={indentStyle}>
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 mb-2">
        <div className="sm:col-span-3">
          <label className="block text-sm font-medium leading-6 text-gray-900">Categoria</label>
          <select
            id="category"
            name="category"
            value={product.category}
            onChange={(e) => {
              handleCategoryChange(e);
              onChange({ ...product, category: e.target.value });
            }}
            autoComplete="category-name"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:max-w-xs sm:text-sm sm:leading-6"
          >
            {categories.map((item) => (
              <option key={item.id_category} value={item.id_category}>{item.name}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <label className="block text-sm font-medium leading-6 text-gray-900">Sotto Categoria</label>
          <select
            id="subcategory"
            name="subcategory"
            value={product.subcategory}
            onChange={(e) => onChange({ ...product, subcategory: e.target.value })}
            autoComplete="subcategory-name"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:max-w-xs sm:text-sm sm:leading-6"
            disabled={subcategories.length === 0}
          >
            {subcategories.map((item) => (
              <option key={item.id_subcategory} value={item.id_subcategory}>{item.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium leading-6 text-gray-900">Quantità</label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          value={product.quantity}
          onChange={(e) => onChange({ ...product, quantity: e.target.value })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:max-w-xs sm:text-sm"
        />
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium leading-6 text-gray-900">Prezzo Unitario</label>
        <div className="relative mt-2 rounded-md shadow-sm">
          <input
            type="text"
            name="unit_price"
            id={`unit_price`}
            value={product.unit_price}
            onChange={(e) => onChange({ ...product, unit_price: e.target.value })}
            className="block w-full rounded-md border-gray-300 left-0 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
            placeholder="0.00"
            aria-describedby="price-currency"
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="block w-full h-full py-0 pl-3 pr-8 bg-transparent border-transparent text-gray-500 focus:border-red-500 focus:ring-red-500 sm:text-sm rounded-md appearance-none"
            >
              {currencies.map((cur) => (
                <option key={cur} value={cur}>{cur}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2" width="20" height="20" fill="none" stroke="currentColor">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex space-x-2 mb-2">
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md border border-red-600 px-3 py-2 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
        >
          Rimuovi Prodotto
        </button>
      </div>
    </div>
  );
}
