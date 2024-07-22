import React, { useEffect } from 'react';
import Select from 'react-tailwindcss-select';

export default function PurchaseRowInput({ product, onChange, onRemove, categories, subcategories, handleCategoryChange, currencies, currency, setCurrency, level = 1 }) {
  const indentStyle = {
    paddingLeft: `${level * 20}px`, // Adjust indentation based on level
    borderLeft: `${level > 0 ? '2px solid #E5E7EB' : 'none'}`, // Indentation border for subproducts
  };
  
  return (
      <div className="border p-4 mb-4 rounded-lg shadow-sm bg-gray-50" style={indentStyle}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 mb-2">
          <div className="sm:col-span-6 mb-2">
            <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
              Descrizione
            </label>
            <textarea
              id="description"
              name="description"
              type="text"
              maxLength={150} // Use maxLength for text inputs
              value={product.description || ''} // Ensure default value is an empty string
              onChange={(e) => onChange({ ...product, description: e.target.value })}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
            />
            <p className="mt-1 text-xs text-gray-500">Massimo 150 caratteri</p>
          </div>
  
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium leading-6 text-gray-900">Categoria</label>
            <Select
              id="category"
              name="category"
              value={{ value: product.category, label: categories.find(c => c.id_category === product.category)?.name }}
              onChange={(option) => {
                handleCategoryChange({ target: { value: option.value } });
                onChange({ ...product, category: option.value });
              }}
              options={categories.map(c => ({ value: c.id_category, label: c.name }))}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
              primaryColor='red'
            />
          </div>
  
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium leading-6 text-gray-900">Sotto Categoria</label>
            <Select
              id="subcategory"
              name="subcategory"
              value={{ value: product.subcategory, label: subcategories.find(s => s.id_subcategory === product.subcategory)?.name }}
              onChange={(option) => onChange({ ...product, subcategory: option.value })}
              options={subcategories.map(s => ({ value: s.id_subcategory, label: s.name }))}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
              isDisabled={subcategories.length === 0}
              primaryColor='red'
            />
          </div>
        </div>

      <div className="mb-2">
        <label className="block text-sm font-medium leading-6 text-gray-900">Quantità</label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min={1}
          value={product.quantity || 1}
          onChange={(e) => onChange({ ...product, quantity: e.target.value })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:max-w-xs sm:text-sm"
        />
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium leading-6 text-gray-900">Prezzo Unitario</label>
        <div className="relative mt-2 rounded-md shadow-sm">
          <input
            type="number"
            step="0.01"
            defaultValue={0.00}
            name="unit_price"
            id={`unit_price`}
            value={product.unit_price}
            onChange={(e) => onChange({ ...product, unit_price: e.target.value })}
            className="block w-full rounded-md border-gray-300 left-0 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
            placeholder="0.00"
            aria-describedby="price-currency"
          />
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
