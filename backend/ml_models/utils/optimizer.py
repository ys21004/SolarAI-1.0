import numpy as np
from scipy.optimize import minimize
from typing import Tuple, List, Callable
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PanelOptimizer:
    def __init__(self, objective_function: Callable):
        self.objective_function = objective_function
        
    def genetic_algorithm(self, bounds: List[Tuple[float, float]], 
                         population_size: int = 50,
                         generations: int = 100) -> Tuple[np.ndarray, float]:
        """Implement Genetic Algorithm for panel optimization."""
        n_dimensions = len(bounds)
        
        # Initialize population
        population = np.random.uniform(
            low=[b[0] for b in bounds],
            high=[b[1] for b in bounds],
            size=(population_size, n_dimensions)
        )
        
        best_solution = None
        best_fitness = float('-inf')
        
        for generation in range(generations):
            # Evaluate fitness
            fitness = np.array([self.objective_function(ind) for ind in population])
            
            # Update best solution
            if np.max(fitness) > best_fitness:
                best_fitness = np.max(fitness)
                best_solution = population[np.argmax(fitness)]
            
            # Selection
            selected_indices = np.random.choice(
                population_size,
                size=population_size,
                p=fitness/fitness.sum()
            )
            population = population[selected_indices]
            
            # Crossover
            for i in range(0, population_size-1, 2):
                if np.random.random() < 0.8:  # Crossover probability
                    crossover_point = np.random.randint(1, n_dimensions)
                    population[i, crossover_point:], population[i+1, crossover_point:] = \
                        population[i+1, crossover_point:].copy(), population[i, crossover_point:].copy()
            
            # Mutation
            mutation_mask = np.random.random(size=(population_size, n_dimensions)) < 0.1
            mutation = np.random.uniform(
                low=[b[0] for b in bounds],
                high=[b[1] for b in bounds],
                size=(population_size, n_dimensions)
            )
            population[mutation_mask] = mutation[mutation_mask]
            
            # Ensure bounds
            population = np.clip(population, 
                               [b[0] for b in bounds],
                               [b[1] for b in bounds])
            
            if generation % 10 == 0:
                logger.info(f"Generation {generation}: Best fitness = {best_fitness}")
                
        return best_solution, best_fitness
        
    def particle_swarm_optimization(self, bounds: List[Tuple[float, float]],
                                  n_particles: int = 30,
                                  max_iterations: int = 100) -> Tuple[np.ndarray, float]:
        """Implement Particle Swarm Optimization for panel optimization."""
        n_dimensions = len(bounds)
        
        # Initialize particles and velocities
        particles = np.random.uniform(
            low=[b[0] for b in bounds],
            high=[b[1] for b in bounds],
            size=(n_particles, n_dimensions)
        )
        velocities = np.zeros((n_particles, n_dimensions))
        
        # Initialize personal and global best
        personal_best = particles.copy()
        personal_best_fitness = np.array([self.objective_function(p) for p in particles])
        global_best_idx = np.argmax(personal_best_fitness)
        global_best = personal_best[global_best_idx].copy()
        global_best_fitness = personal_best_fitness[global_best_idx]
        
        # PSO parameters
        w = 0.7  # Inertia weight
        c1 = 1.5  # Cognitive parameter
        c2 = 1.5  # Social parameter
        
        for iteration in range(max_iterations):
            # Update velocities and positions
            r1, r2 = np.random.random(2)
            velocities = (w * velocities +
                         c1 * r1 * (personal_best - particles) +
                         c2 * r2 * (global_best - particles))
            
            particles += velocities
            
            # Ensure bounds
            particles = np.clip(particles,
                              [b[0] for b in bounds],
                              [b[1] for b in bounds])
            
            # Evaluate new positions
            fitness = np.array([self.objective_function(p) for p in particles])
            
            # Update personal best
            better_positions = fitness > personal_best_fitness
            personal_best[better_positions] = particles[better_positions]
            personal_best_fitness[better_positions] = fitness[better_positions]
            
            # Update global best
            if np.max(fitness) > global_best_fitness:
                global_best_idx = np.argmax(fitness)
                global_best = particles[global_best_idx].copy()
                global_best_fitness = fitness[global_best_idx]
            
            if iteration % 10 == 0:
                logger.info(f"Iteration {iteration}: Best fitness = {global_best_fitness}")
                
        return global_best, global_best_fitness
        
    def scipy_optimize(self, bounds: List[Tuple[float, float]], 
                      method: str = 'L-BFGS-B') -> Tuple[np.ndarray, float]:
        """Use SciPy's optimize module for panel optimization."""
        x0 = np.array([(b[0] + b[1])/2 for b in bounds])  # Initial guess
        
        result = minimize(
            fun=lambda x: -self.objective_function(x),  # Minimize negative of objective
            x0=x0,
            method=method,
            bounds=bounds,
            options={'maxiter': 1000}
        )
        
        return result.x, -result.fun  # Return solution and negated objective value 