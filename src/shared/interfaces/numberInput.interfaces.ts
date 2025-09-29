export interface NumberInputConfig {
  min: number;
  max: number;
}

export interface NumberInputProps {
    value?: number;
    onChange?: (value: number) => void;
}