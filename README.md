# Health Classification Dashboard

A responsive web-based dashboard for visualizing health statistics and predicting probable illnesses using a machine learning classification model.

## Features

- **Illness Classification Model**: Predicts probable health conditions based on gender, age group, and care type
- **Interactive Dashboard**: Displays key health metrics and trends
- **Data Visualization**: Multiple chart types (line, bar, pie, radar) to represent different health data
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Built with Tailwind CSS for a clean, modern interface

## Classification Model

The dashboard integrates with a health classification API that predicts probable illnesses:

- **Input parameters**: Gender, age group, and type of healthcare attention
- **Results**: Top probable illness categories with their probabilities
- **Visualization**: Results are shown in an interactive horizontal bar chart

The classification model is accessible through an API endpoint at `http://34.59.142.100:80/predict`.

### Example Request:
```json
{
  "genero": "Mujeres",
  "grupo_edad": "20 - 24 años",
  "tipo_atencion": "externa"
}
```

### Example Response:
```json
{
  "resultado": [
    {
      "categoria": "Genitourinarias",
      "probabilidad": 21.71
    },
    {
      "categoria": "Factores que influyen en el estado de salud",
      "probabilidad": 19.47
    },
    {
      "categoria": "Ojo, oído y anexos",
      "probabilidad": 12.35
    }
  ]
}
```

## Technology Stack

- HTML5
- JavaScript (ES6+)
- [Tailwind CSS](https://tailwindcss.com/) (via CDN)
- [Chart.js](https://www.chartjs.org/) for data visualization
- Fetch API for making HTTP requests to the classification API

## Getting Started

1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. No build process or dependencies to install - everything is loaded via CDN
4. Fill out the classification form to get illness predictions

## Project Structure

- `index.html` - Main HTML structure with classification form and dashboard
- `styles.css` - Custom CSS styles
- `script.js` - JavaScript functionality for classification API integration and data visualization

## Usage Notes

- The classification model returns predictions based on statistical patterns in healthcare data
- Results should be interpreted by healthcare professionals
- This is a demonstration project with supplementary mock data for the health statistics section
- In a production environment, you would connect to actual health data APIs

## Customization

You can easily customize this dashboard by:

1. Modifying the classification form to include additional parameters
2. Changing the visualization style of the classification results
3. Connecting to different healthcare APIs
4. Adjusting chart configurations to match your specific requirements
5. Extending the UI with additional sections or visualizations

## License

MIT License - Feel free to use and modify for your own projects.

## Screenshot

![Health Classification Dashboard](https://placeholder-for-screenshot.com/dashboard-screenshot.jpg) 