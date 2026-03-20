package com.bunihoppon;

import com.bunihoppon.arithmetics.Add.ArithmeticsAdd;
import com.bunihoppon.arithmetics.Diff.ArithmeticsDiff;
import com.bunihoppon.arithmetics.Div.ArithmeticsDiv;
import com.bunihoppon.arithmetics.Mult.ArithmeticsMult;
import com.bunihoppon.team.TeamInfo;

// Displays team members and runs arithmetic tests.
public class Main {
    void main(String[] args) {
        TeamInfo.display();
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