function calculateIC50() {
    var concentrations = [];
    var percentages = [];

    // Retrieve concentration and percentage values from input fields
    for (var i = 1; i <= 5; i++) {
        var concentration = parseFloat(document.getElementById("concentration" + i).value);
        var percentage = parseFloat(document.getElementById("percentage" + i).value);

        concentrations.push(concentration);
        percentages.push(percentage);
    }

    // Calculate the IC50 value
    var ic50 = calculateIC50Value(concentrations, percentages);

    var resultElement = document.getElementById("result");
    resultElement.textContent = "IC50 Value: " + ic50.toFixed(2) + " uM";
}

function calculateIC50Value(concentrations, percentages) {
    // Perform Four-Parameter Logistic (4PL) regression
    var n = concentrations.length;

    // Calculate the top (upper asymptote) and bottom (lower asymptote) values
    var top = Math.max(...percentages);
    var bottom = Math.min(...percentages);

    // Find the index of the concentration closest to the midpoint
    var midIndex = Math.floor(n / 2);
    var midConcentration = concentrations[midIndex];

    // Calculate the Hill slope (steepness)
    var hillSlope = 1.0;

    // Perform regression to estimate the IC50 value
    var ic50 = null;
    var tolerance = 1e-6;
    var maxIterations = 100;
    var iteration = 0;
    var error = Number.MAX_VALUE;

    while (error > tolerance && iteration < maxIterations) {
        var numerator = 0.0;
        var denominator = 0.0;

        for (var i = 0; i < n; i++) {
            var concentration = concentrations[i];
            var percentage = percentages[i];

            var exponent = hillSlope * (Math.log10(concentration) - Math.log10(midConcentration));
            var response = bottom + (top - bottom) / (1.0 + Math.pow(10, exponent));

            var residual = response - percentage;
            var weightedResidual = residual * Math.abs(response) * (100.0 - Math.abs(response)) / 10000.0;

            numerator += weightedResidual * Math.log(10) * Math.pow(10, exponent) * Math.log10(concentration);
            denominator += weightedResidual * Math.pow(10, exponent) * Math.pow(Math.log10(concentration), 2);
        }

        var prevIC50 = ic50;
        ic50 = midConcentration - (numerator / denominator);
        error = Math.abs(ic50 - prevIC50);

        iteration++;
    }

    return ic50;
}