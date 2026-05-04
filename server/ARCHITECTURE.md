# Investara Real-time Stock Analysis Pipeline Architecture

This document outlines the high-performance architecture of the Investara Trading Terminal.

## 1. Data Ingestion
- **WebSockets**: Persistent connections to simulated NSE/BSE tick feeds.
- **Pipeline Entry**: `PipelineService.ingestTick()` handles all incoming raw data.

## 2. Stream Processing (Flink-style)
- **Technical Indicators**: Real-time calculation of SMA, EMA, RSI, MACD, and Bollinger Bands.
- **Latency Benchmark**: Sub-100ms processing target (Current avg: <5ms).

## 3. Storage Strategy (Dual-Storage)
- **Redis Cluster**: Hot data storage for sub-millisecond retrieval of the latest quotes and indicators.
- **PostgreSQL**: Partitioned tables for efficient historical data storage and indexing.

## 4. ML Forecasting (LSTM)
- **Model**: LSTM neural network for trend forecasting.
- **Pipeline**: Daily retraining based on the last 24h of market activity.
- **Target**: >75% directional accuracy.

## 5. Alert & Notification Engine
- **Monitoring**: Continuous threshold monitoring for price, volume spikes, and anomalies.
- **Channels**: Email, SMS, and Push notification integration.

## 6. Visualization
- **TradingView**: Lightweight Charts integrated for high-performance real-time charting.
- **Updates**: Push-based updates via WebSockets for zero-refresh UI.

## 7. Monitoring & Reliability
- **Prometheus**: Metrics collection available at `/metrics`.
- **Grafana**: Dashboards for visualizing system health and pipeline throughput.
- **Availability**: 99.9% uptime target with automated failover logic.

## 8. API Documentation
- **Base URL**: `/api`
- **Endpoints**:
  - `GET /stocks`: List all stocks.
  - `GET /stocks/:symbol`: Detailed stock info with latest analysis.
  - `GET /portfolio`: User's real-time portfolio valuation.
  - `POST /orders/place`: High-speed order execution.
  - `GET /metrics`: Prometheus performance metrics.
