package com.AI_BASED.BACKEND.UTIL;

import java.util.HashSet;
import java.util.Set;

public class TextSimilarityUtil {

    public static double calculateSimilarity(String text1, String text2) {

        String[] words1 = text1.toLowerCase().split(" ");
        String[] words2 = text2.toLowerCase().split(" ");

        Set<String> set1 = new HashSet<>();
        Set<String> set2 = new HashSet<>();

        for (String word : words1) {
            set1.add(word);
        }

        for (String word : words2) {
            set2.add(word);
        }

        Set<String> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);

        Set<String> union = new HashSet<>(set1);
        union.addAll(set2);

        return (double) intersection.size() / union.size();
    }
}
