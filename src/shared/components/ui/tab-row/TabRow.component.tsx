import './TabRow.component.scss';

export interface TabItem<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface TabRowProps<T extends string = string> {
  value: T;
  items: TabItem<T>[];
  onSelect: (value: T) => void;
  ariaLabel?: string;
  className?: string;
}

function TabRow<T extends string = string>({ value, items, onSelect, ariaLabel = 'Darstellungsmodus', className }: TabRowProps<T>) {
  return (
    <div className={`tabs ${className ?? ''}`.trim()} role="tablist" aria-label={ariaLabel}>
      {items.map((item) => (
        <button
          key={item.value}
          className={`tab ${value === item.value ? 'active' : ''}`}
          role="tab"
          aria-selected={value === item.value}
          aria-disabled={item.disabled || undefined}
          disabled={item.disabled}
          onClick={() => !item.disabled && onSelect(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default TabRow;
