package com.bunihoppon;

import com.bunihoppon.arithmetics.Add.ArithmeticsAdd;
import com.bunihoppon.arithmetics.Diff.ArithmeticsDiff;
import com.bunihoppon.arithmetics.Div.ArithmeticsDiv;
import com.bunihoppon.arithmetics.Mult.ArithmeticsMult;

// Displays team members and runs arithmetic tests.
public class Main {
    void main(String[] args) {
        // It may be better to declare a constant array of
        // team members alongside their roles
        // Main entry point: prints team info and runs arithmetic operation tests
        IO.println(
                "BunniHopPon Andrii Bialkovskyi (253190) github: justkinou (SCRUM Master / DevOps)");
        IO.println(
                "lostbtw Tester");
        IO.println("B1ona4y - Developer");
        IO.println("Kitavaxx - Developer");
        IO.println("mikita672 - Developer");

        testArithmetics();
    }
    // Runs basic arithmetic checks (add, subtract, multiply, divide) and verifies division-by-zero handling.
    public static void testArithmetics() {
        IO.println("=== Add test ===");
        ArithmeticsAdd aadd = new ArithmeticsAdd();
        IO.println(aadd.Addition(10, 2));

        IO.println("=== Diff test ===");
        ArithmeticsDiff adiff = new ArithmeticsDiff();
        IO.println(adiff.Difference(10, 2));

        IO.println("=== Mult test ===");
        ArithmeticsMult amult = new ArithmeticsMult();
        IO.println(amult.Multiplication(10, 2));
        IO.println("=== Mult test 2 ===");
        IO.println(amult.Multiplication(10, 0));
        // Valid division test
        IO.println("=== Div test ===");
        ArithmeticsDiv adiv = new ArithmeticsDiv();
        IO.println(adiv.Division(10, 2));
        // Division by zero test (should throw ArithmeticException)
        IO.println("=== Div test 2 ===");
        try {
            IO.println(adiv.Division(10, 0));
        } catch (ArithmeticException e) {
            IO.println(e);
        }
        IO.println("=== Div test 3 ===");
        IO.println(adiv.Division(7, -2));
    }
}