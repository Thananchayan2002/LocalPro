import { motion } from "framer-motion";

const PriceEstimatorSection = ({
  selectedService,
  setSelectedService,
  hours,
  setHours,
  estimatedCost,
}) => {
  return (
    <section className="py-4 lg:py-8 bg-background">
      <div className="container mx-auto px-4 flex flex-col items-center text-center">
        <div className="max-w-2xl mx-auto w-full">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 font-display">
              Quick Price Estimator
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Get an instant estimate for your service
            </p>
          </div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            className="section-gradient rounded-2xl p-4 sm:p-6 shadow-soft-lg"
          >
            <div className="space-y-4">
              <div className="text-left">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Select Service
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full p-3 rounded-xl focus:outline-none bg-card text-foreground cursor-pointer transition-colors"
                >
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="carpentry">Carpentry</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="painting">Painting</option>
                  <option value="ac">AC Repair</option>
                </select>
              </div>

              <div className="text-left">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Estimated Hours: {hours}
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1 hr</span>
                  <span>8 hrs</span>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-card rounded-xl p-4 flex items-center justify-between shadow-soft"
              >
                <div className="text-left">
                  <p className="text-sm text-muted-foreground mb-1">
                    Estimated Cost
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    Rs. {estimatedCost.toLocaleString()}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 btn-primary rounded-xl cursor-pointer"
                >
                  Book Now
                </motion.button>
              </motion.div>

              <p className="text-xs text-center text-muted-foreground">
                *Final price may vary based on actual work scope and materials
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PriceEstimatorSection;
