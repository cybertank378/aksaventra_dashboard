export interface TimeSeriesPointProps {
  bucket: string;
  label: string;
  value: number;
}

export class TimeSeriesPoint {
  private readonly _bucket: string;
  private readonly _label: string;
  private readonly _value: number;

  constructor(props: TimeSeriesPointProps) {
    if (props.value < 0) {
      throw new Error("TimeSeriesPoint value must be non-negative.");
    }
    this._bucket = props.bucket;
    this._label = props.label;
    this._value = props.value;
  }

  get bucket(): string {
    return this._bucket;
  }

  get label(): string {
    return this._label;
  }

  get value(): number {
    return this._value;
  }

  public toJSON(): TimeSeriesPointProps {
    return {
      bucket: this._bucket,
      label: this._label,
      value: this._value,
    };
  }
}
