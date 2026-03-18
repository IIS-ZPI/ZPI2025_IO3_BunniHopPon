package com.bunihoppon;

import com.bunihoppon.Arithmetics.Addition.ArithmeticsAdd;
import com.bunihoppon.Arithmetics.Addition.IArithmeticsAdd;
import com.bunihoppon.Arithmetics.Difference.ArithmeticsDiff;
import com.bunihoppon.Arithmetics.Difference.IArithmeticsDiff;
import com.bunihoppon.Arithmetics.Division.ArithmeticsDiv;
import com.bunihoppon.Arithmetics.Division.IArithmeticsDiv;
import com.bunihoppon.Arithmetics.Multiplication.ArithmeticsMult;
import com.bunihoppon.Arithmetics.Multiplication.IArithmeticsMult;;

public class Main {
    public static void main(String[] args) {
        System.out.println(
                "BunniHopPon Andrii Bialkovskyi (253190) github: justkinou (SCRUM Master / DevOps)");
        System.out.println(
                "lostbtw Tester");
        System.out.println("B1ona4y - developer");
        System.out.println("Kitavaxx - Developer");
        System.out.println("mikita672 - developer");

        IArithmeticsAdd adder = new ArithmeticsAdd();
        System.out.println(adder.Addition(1, 2));
        
        IArithmeticsDiff subtracter = new ArithmeticsDiff();
        System.out.println(subtracter.Difference(1, 2));

        IArithmeticsMult multiplier = new ArithmeticsMult();
        System.out.println(multiplier.Multiplication(3, 2));

        IArithmeticsDiv divider = new ArithmeticsDiv();
        System.out.println(divider.Division(15, 2));
    }
}