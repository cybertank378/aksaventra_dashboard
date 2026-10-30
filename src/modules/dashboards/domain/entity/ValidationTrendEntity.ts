import type {
  TimeSeriesChartResponseDTO,
  TimeSeriesChartSeriesDTO,
} from "@/modules/dashboards/domain/dto/DashboardResponseDTO";
import type { ChartGranularity } from "@/modules/dashboards/domain/types/ChartGranularity";
import type { ChartRange } from "@/modules/dashboards/domain/types/ChartRange";
import type { ValidationTrendSeriesKey } from "@/modules/dashboards/domain/types/ValidationTrendSeriesKey";
import type { TimeSeriesPoint } from "@/modules/dashboards/domain/value-object/TimeSeriesPoint";

export interface ValidationTrendSeriesInput {
  key: ValidationTrendSeriesKey;
  label: string;
  points: TimeSeriesPoint[];
}

export interface ValidationTrendProps {
  range: ChartRange;
  granularity: ChartGranularity;
  timezone: string;
  series: ValidationTrendSeriesInput[];
}

export class ValidationTrendEntity {
  private readonly props: ValidationTrendProps;

  constructor(props: ValidationTrendProps) {
    this.props = { ...props };
  }

  get range(): ChartRange {
    return this.props.range;
  }

  get granularity(): ChartGranularity {
    return this.props.granularity;
  }

  get timezone(): string {
    return this.props.timezone;
  }

  get series(): readonly ValidationTrendSeriesInput[] {
    return this.props.series;
  }

  public getTotalForSeries(key: ValidationTrendSeriesKey): number {
    const target = this.props.series.find((s) => s.key === key);
    if (!target) {
      return 0;
    }
    return target.points.reduce((acc, pt) => acc + pt.value, 0);
  }

  public getTotalCount(): number {
    return this.props.series.reduce((sum, s) => {
      return sum + s.points.reduce((pSum, pt) => pSum + pt.value, 0);
    }, 0);
  }

  public getSuccessRate(): number {
    const total = this.getTotalCount();
    if (total === 0) {
      return 0;
    }
    const successful = this.getTotalForSeries("activated") + this.getTotalForSeries("verified");
    const rate = (successful / total) * 100;
    return Math.round(rate * 10) / 10;
  }

  public toDTO(): TimeSeriesChartResponseDTO<ValidationTrendSeriesKey> {
    const seriesDTO: TimeSeriesChartSeriesDTO<ValidationTrendSeriesKey>[] = this.props.series.map(
      (s) => ({
        key: s.key,
        label: s.label,
        total: s.points.reduce((acc, pt) => acc + pt.value, 0),
        points: s.points.map((pt) => pt.toJSON()),
      }),
    );

    return {
      range: this.props.range,
      granularity: this.props.granularity,
      timezone: this.props.timezone,
      series: seriesDTO,
    };
  }
}
