import React, { useMemo, useEffect, useCallback } from 'react';
import Select from 'react-tailwindcss-select';
import { TrashIcon } from '@heroicons/react/20/solid';

export default function ContractUpdateRow({
  contractrow = {}, // Valore predefinito come oggetto vuoto
  recurrence_number,
  index,
  categories = [],
  subcategories = [],
  subsubcategories = [],
  onChange,
  onRemove,
  handleCategoryChange,
  handleSubcategoryChange,
}) {
  // Aggiunge valori predefiniti per evitare undefined
  const defaultContractRow = {
    taxed_unit_price: '',
    vat: '',
    quantity: '',
    unit_price: '',
    total: '',
    totalprice: '',
    taxed_totalprice: '',
    category: '',
    subcategory: '',
    subsubcategory: '',
    ...contractrow, // Sovrascrive con i valori reali se presenti
  };

  contractrow = defaultContractRow;

  const Vat = ['22', '10', '4', '0'];

  const handleDeleteClick = () => {
    const confirmed = window.confirm('Sei sicuro di voler eliminare questo prodotto?');
    if (confirmed) {
      onRemove(index);
    }
  };

  const handleChange = useCallback(
    (updatedContractRow) => {
      onChange(updatedContractRow);
    },
    [onChange]
  );

  // Calcoli per valori derivati
  useEffect(() => {
    if (contractrow.taxed_unit_price && contractrow.vat) {
      const taxedUnitPrice = parseFloat(contractrow.taxed_unit_price) || 0;
      const vatRate = parseFloat(contractrow.vat) || 0;
      const quantity = parseFloat(contractrow.quantity) || 0;

      const unitPriceWithVat = taxedUnitPrice * (1 + vatRate / 100);
      const totalWithVat = unitPriceWithVat * quantity;

      if (
        contractrow.unit_price !== unitPriceWithVat.toFixed(2) ||
        contractrow.total !== totalWithVat.toFixed(2)
      ) {
        handleChange({
          ...contractrow,
          unit_price: unitPriceWithVat.toFixed(2),
          total: totalWithVat.toFixed(2),
        });
      }
    }
  }, [contractrow.taxed_unit_price, contractrow.vat, contractrow.quantity, handleChange]);

  const calculatedTotalTassato = useMemo(() => {
    const taxedUnitPrice = parseFloat(contractrow.taxed_unit_price || 0);
    const quantity = parseFloat(contractrow.quantity || 0);
    return (taxedUnitPrice * quantity).toFixed(2);
  }, [contractrow.taxed_unit_price, contractrow.quantity]);

  const calculatedTotal = useMemo(() => {
    const unitPrice = parseFloat(contractrow.unit_price || 0);
    const quantity = parseFloat(contractrow.quantity || 0);
    return (unitPrice * quantity).toFixed(2);
  }, [contractrow.unit_price, contractrow.quantity]);

  const taxedTotalRecurrent = useMemo(() => {
    const taxedUnitPrice = parseFloat(contractrow.taxed_unit_price || 0);
    return (taxedUnitPrice * recurrence_number).toFixed(2);
  }, [contractrow.taxed_unit_price, recurrence_number]);

  const totalRecurrent = useMemo(() => {
    const unitPrice = parseFloat(contractrow.unit_price || 0);
    return (unitPrice * recurrence_number).toFixed(2);
  }, [contractrow.unit_price, recurrence_number]);

  return (
    <div className="border border-gray-200 rounded p-2 text-xs">
      <table className="w-full text-left text-[10px] border-collapse">
        <tbody>
          {/* Categoria e Sottocategoria */}
          <tr>
            <td className="block text-[11px] font-medium text-gray-700">Macro Categoria</td>
            <td className="w-3/4">
              <Select
                id={`category-${index}`}
                placeholder="Seleziona"
                value={
                  contractrow.category
                    ? { value: contractrow.category, label: categories.find(c => c.id_category === contractrow.category)?.name }
                    : null
                }
                onChange={(option) => {
                  const selectedCategory = option?.value || '';
                  onChange({ ...contractrow, category: selectedCategory, subcategory: '', subsubcategory: '' });
                  handleCategoryChange(index, selectedCategory);
                }}
                options={categories.map(c => ({ value: c.id_category, label: c.name }))}
                className="text-[10px]"
                primaryColor="#7fb7d4"
                isSearchable
              />
            </td>
          </tr>
          <tr>
            <td className="block text-[11px] font-medium text-gray-700">Categoria</td>
            <td>
              <Select
                id={`subcategory-${index}`}
                placeholder="Seleziona"
                value={
                  contractrow.subcategory
                    ? { value: contractrow.subcategory, label: subcategories.find(s => s.id_subcategory === contractrow.subcategory)?.name }
                    : null
                }
                onChange={(option) => {
                  const selectedSubcategory = option?.value || '';
                  onChange({ ...contractrow, subcategory: selectedSubcategory, subsubcategory: '' });
                  handleSubcategoryChange(index, selectedSubcategory);
                }}
                options={subcategories.map(s => ({ value: s.id_subcategory, label: s.name }))}
                className="text-[10px]"
                isSearchable
                primaryColor="#7fb7d4"
              />
            </td>
          </tr>
          <tr>
            <td className="block text-[11px] font-medium text-gray-700">Sottocategoria</td>
            <td>
              <Select
                id={`subsubcategory-${index}`}
                placeholder="Seleziona"
                value={
                  contractrow.subsubcategory
                    ? { value: contractrow.subsubcategory, label: subsubcategories.find(s => s.id_subsubcategory === contractrow.subsubcategory)?.name }
                    : null
                }
                onChange={(option) => onChange({ ...contractrow, subsubcategory: option?.value || '' })}
                options={subsubcategories?.map(s => ({ value: s.id_subsubcategory, label: s.name }))}
                className="text-[10px]"
                isDisabled={subcategories.length === 0}
                primaryColor="#7fb7d4"
              />
            </td>
          </tr>

          {/* Valori numerici */}
          <tr>
            <td className="block text-[11px] font-medium text-gray-700">Importo Ricorrente Unitario IVA Esclusa</td>
            <td>
              <input
                type="number"
                value={contractrow.taxed_unit_price || calculatedTotal}
                onChange={(e) => onChange({ ...contractrow, taxed_unit_price: e.target.value })}
                className="w-full text-[12px] rounded border-gray-300"
              />
            </td>
          </tr>
          <tr>
            <td className="block text-[11px] font-medium text-gray-700">IVA</td>
            <td>
              <Select
                id={`vat-${index}`}
                value={contractrow.vat ? { value: contractrow.vat, label: contractrow.vat } : null}
                onChange={(option) => onChange({ ...contractrow, vat: option?.value || '' })}
                options={Vat.map(v => ({ value: v, label: v }))}
                placeholder="IVA"
                className="text-[12px] rounded-md border-gray-300"
              />
            </td>
          </tr>
          <tr>
            <td className="block text-[11px] font-medium text-gray-700">Importo Unitario IVA Inclusa</td>
            <td>
              <input
                type="number"
                value={contractrow.unit_price || ''}
                onChange={(e) => onChange({ ...contractrow, unit_price: e.target.value })}
                className="w-full text-[12px] rounded border-gray-300"
              />
            </td>
          </tr>
          <tr>
            <td className="block text-[11px] font-medium text-gray-700">Importo Totale IVA Esclusa</td>
            <td>
              <input
                type="text"
              value={isNaN(taxedTotalRecurrent) ? 0 : taxedTotalRecurrent}
               className="w-full text-xs rounded-md border-gray-300 bg-gray-100 cursor-not-allowed"
                disable
              />
            </td>
          </tr>
          <tr>
            <td className="block text-[11px] font-medium text-gray-700">Importo Totale IVA Inclusa</td>
            <td>
              <input
                type="text"
              value={isNaN(totalRecurrent) ? 0 : totalRecurrent}
                className="w-full text-xs rounded-md border-gray-300 bg-gray-100 cursor-not-allowed"
                disable
              />
            </td>
          </tr>

          {/* Azione Elimina */}
          <tr>
            <td colSpan="4" className="text-right py-1">
              <button
                type="button"
                onClick={handleDeleteClick}
                className="text-red-500 hover:text-red-700"
              >
                <TrashIcon className="h-5 w-5 inline" /> Rimuovi
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
