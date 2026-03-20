package com.bunihoppon.arithmetics.Div;

// Performs division and throws an exception when the divisor is zero.
public class ArithmeticsDiv implements IArithmeticsDiv {

    // TODO: consider declaring a checked exception (also in the IArithmeticsDiv)
    @Override
    public double Division(double A, double B) {
        if (B == 0.0) {
            throw new ArithmeticException("Division by zero"); 
        }
        
        return A / B;
    }
}
