import unittest
from pathlib import Path
from app.carbon_math import compute_ecosystem_stock_tc, calculate_sequestration_tco2e, load_carbon_params

class TestCarbonMath(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        demo_path = Path(__file__).parent.parent / "app" / "demo_params.yaml"
        cls.demo_params = load_carbon_params(demo_path)

    def test_carbon_stock_calculation(self):
        # 100 ha of Mangrove
        # AGB: 120, BGB: 40, SOC: 280 -> Total: 440 tC/ha -> 44,000 tC
        stock = compute_ecosystem_stock_tc(100.0, "mangrove", self.demo_params)
        self.assertEqual(stock["area_ha"], 100.0)
        self.assertEqual(stock["agb_tc"], 12000.0)
        self.assertEqual(stock["bgb_tc"], 4000.0)
        self.assertEqual(stock["soc_tc"], 28000.0)
        self.assertEqual(stock["total_stock_tc"], 44000.0)

    def test_sequestration_math_and_discounts(self):
        baseline_stock = 40000.0
        current_stock = 41000.0  # +1,000 tC delta
        calc = calculate_sequestration_tco2e(baseline_stock, current_stock, "mangrove", self.demo_params)

        self.assertEqual(calc["delta_tc"], 1000.0)
        expected_gross = 1000.0 * (44.0 / 12.0)
        self.assertAlmostEqual(calc["tco2e_gross"], expected_gross, places=2)

        expected_discount = expected_gross * 0.10
        self.assertAlmostEqual(calc["uncertainty_discount"], expected_discount, places=2)

        subtotal = expected_gross - expected_discount
        expected_leakage = subtotal * 0.05
        self.assertAlmostEqual(calc["leakage"], expected_leakage, places=2)

        expected_net = subtotal - expected_leakage
        self.assertAlmostEqual(calc["tco2e_net"], expected_net, places=2)

        self.assertEqual(calc["estimated_milli_tco2e"], int(expected_net * 1000))
        self.assertIsInstance(calc["estimated_milli_tco2e"], int)

if __name__ == "__main__":
    unittest.main()
