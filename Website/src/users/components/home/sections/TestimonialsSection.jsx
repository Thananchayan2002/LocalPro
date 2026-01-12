import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useAnimations } from "../../animations/animations";

const TestimonialsSection = ({ testimonials, currentIndex, setCurrentIndex }) => {
    const { ref, animate, staggerContainer, staggerItem } = useAnimations({
        scroll: true,
    });

    return (
        <section ref={ref} className="py-6 sm:py-8 lg:py-12 bg-background">
            <div className="mx-auto max-w-7xl px-4">
                {/* Header */}
                <div className="mb-10 text-center">
                    <h2 className="mb-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                        What Our Customers Say
                    </h2>
                    <p className="text-base sm:text-lg text-muted-foreground">
                        Join thousands of satisfied customers
                    </p>
                </div>

                {/* Testimonials Grid */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate={animate}
                    className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            variants={staggerItem}
                            whileHover={{ y: -4 }}
                            className="rounded-2xl bg-card p-6 shadow-sm transition-shadow duration-300 hover:shadow-md"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <img
                                    src={testimonial.image}
                                    alt={testimonial.name}
                                    className="w-12 h-12 rounded-full"
                                />
                                <div>
                                    <h4 className="font-semibold text-foreground">
                                        {testimonial.name}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {testimonial.role}
                                    </p>
                                </div>
                            </div>

                            <div className="flex mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i < testimonial.rating
                                                ? "text-yellow-500 fill-yellow-500"
                                                : "text-gray-300 dark:text-gray-600"
                                            }`}
                                    />
                                ))}
                            </div>

                            <p className="text-sm leading-relaxed text-muted-foreground italic">
                                "{testimonial.text}"
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
