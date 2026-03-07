import { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';

// Custom Input Component
const CustomInput = forwardRef(({ value, onClick, label }, ref) => (
    <div className="w-full">
        {label && (
            <label className="block text-sm font-medium mb-1.5 text-gray-700">
                {label}
            </label>
        )}
        <button
            type="button"
            onClick={onClick}
            ref={ref}
            className="relative w-full px-4 py-3 bg-[#F5F5F5] border-0 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CE0201] font-medium text-base cursor-pointer hover:bg-gray-100 transition-colors text-left"
        >
            <span className="flex items-center gap-2">
                <Calendar size={18} className="text-gray-600" strokeWidth={2} />
                <span className="block truncate">{value || 'Seleccionar fecha'}</span>
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CE0201" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </span>
        </button>
    </div>
));

CustomInput.displayName = 'CustomInput';

export default function CustomDatePicker({
    selected,
    onChange,
    label,
    dateFormat = "MMMM yyyy",
    showMonthYearPicker = false,
    showFullMonthYearPicker = false,
    minDate,
    maxDate,
    ...props
}) {
    return (
        <DatePicker
            selected={selected}
            onChange={onChange}
            dateFormat={dateFormat}
            showMonthYearPicker={showMonthYearPicker}
            showFullMonthYearPicker={showFullMonthYearPicker}
            minDate={minDate}
            maxDate={maxDate}
            customInput={<CustomInput label={label} />}
            calendarClassName="custom-calendar"
            {...props}
        />
    );
}
