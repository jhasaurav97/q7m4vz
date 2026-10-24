from analysis import build_analysis


def test_selects_latest_forecast_before_cutoff():
    actuals = [
        {
            "fuelType": "WIND",
            "startTime": "2026-01-02T00:00:00Z",
            "generation": 100,
        },
        {
            "fuelType": "WIND",
            "startTime": "2026-01-02T00:30:00Z",
            "generation": 300,
        },
        {
            "fuelType": "WIND",
            "startTime": "2026-01-02T01:00:00Z",
            "generation": 150,
        },
        {
            "fuelType": "WIND",
            "startTime": "2026-01-02T01:30:00Z",
            "generation": 250,
        },
        {
            "fuelType": "WIND",
            "startTime": "2026-01-02T02:00:00Z",
            "generation": 10,
        },
    ]

    forecasts = [
        {
            "startTime": "2026-01-02T00:00:00Z",
            "publishTime": "2026-01-01T09:20:00Z",
            "generation": 100,
        },
        {
            "startTime": "2026-01-02T00:00:00Z",
            "publishTime": "2026-01-01T09:45:00Z",
            "generation": 150,
        },
        {
            "startTime": "2026-01-02T00:00:00Z",
            "publishTime": "2026-01-01T10:00:00Z",
            "generation": 9999,
        },
        {
            "startTime": "2026-01-02T01:00:00Z",
            "publishTime": "2026-01-01T09:30:00Z",
            "generation": 300,
        },
        {
            "startTime": "2026-01-02T02:00:00Z",
            "publishTime": "2026-01-01T09:30:00Z",
            "generation": 50,
        },
    ]

    result = build_analysis(actuals, forecasts)

    assert result["metrics"]["matchedIntervals"] == 2

    first_row = result["data"][0]

    assert first_row["actualGenerationMw"] == 200

    assert first_row["forecastGenerationMw"] == 150
    assert first_row["publishTime"] == "2026-01-01T09:45:00Z"

    assert result["metrics"]["maeMw"] == 75
    assert result["metrics"]["rmseMw"] == 79.06
    assert result["metrics"]["wapePercent"] == 37.5

    assert all(
        row["startTime"] != "2026-01-02T02:00:00Z"
        for row in result["data"]
    )


def test_empty_data_does_not_create_fake_metrics():
    result = build_analysis([], [])

    assert result["data"] == []
    assert result["metrics"]["matchedIntervals"] == 0
    assert result["metrics"]["expectedIntervals"] == 744
    assert result["metrics"]["coveragePercent"] == 0

    assert result["metrics"]["maeMw"] is None
    assert result["metrics"]["rmseMw"] is None
    assert result["metrics"]["wapePercent"] is None