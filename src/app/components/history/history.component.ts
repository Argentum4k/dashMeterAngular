import { Component, computed, inject, signal, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { Meal, Targets } from '../../models/meal.model';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-history',
  imports: [RouterLink],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private storageService = inject(StorageService);
  private chart: Chart | null = null;

  allMeals = signal<{ [date: string]: Meal[] }>({});
  targets = signal<Targets | null>(null);
  selectedDate = signal<string | null>(null);

  dailyStats = computed(() => {
    const meals = this.allMeals();
    const stats: Array<{
      date: string;
      proteins: number;
      fats: number;
      carbs: number;
      mealCount: number;
    }> = [];

    Object.keys(meals)
      .sort((a, b) => b.localeCompare(a))
      .forEach(date => {
        const dayMeals = meals[date];
        const totals = dayMeals.reduce(
          (acc, meal) => ({
            proteins: acc.proteins + meal.proteins,
            fats: acc.fats + meal.fats,
            carbs: acc.carbs + meal.carbs
          }),
          { proteins: 0, fats: 0, carbs: 0 }
        );
        stats.push({
          date,
          ...totals,
          mealCount: dayMeals.length
        });
      });

    return stats;
  });

  selectedDayMeals = computed(() => {
    const date = this.selectedDate();
    if (!date) return [];
    return this.allMeals()[date] || [];
  });

  constructor() {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  selectDate(date: string): void {
    this.selectedDate.set(this.selectedDate() === date ? null : date);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === this.storageService.getTodayDate()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  }

  private loadData(): void {
    this.allMeals.set(this.storageService.getAllMeals());
    this.targets.set(this.storageService.getTargets());
  }

  private createChart(): void {
    if (!this.chartCanvas) return;

    const stats = this.dailyStats().slice().reverse();
    const dates = stats.map(s => this.formatDate(s.date));
    const proteins = stats.map(s => s.proteins);
    const fats = stats.map(s => s.fats);
    const carbs = stats.map(s => s.carbs);

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Белки',
            data: proteins,
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4
          },
          {
            label: 'Жиры',
            data: fats,
            borderColor: 'rgb(236, 72, 153)',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
            tension: 0.4
          },
          {
            label: 'Углеводы',
            data: carbs,
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#e5e7eb'
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#9ca3af'
            },
            grid: {
              color: 'rgba(156, 163, 175, 0.1)'
            }
          },
          y: {
            ticks: {
              color: '#9ca3af'
            },
            grid: {
              color: 'rgba(156, 163, 175, 0.1)'
            }
          }
        }
      }
    };

    this.chart = new Chart(this.chartCanvas.nativeElement, config);
  }
}

