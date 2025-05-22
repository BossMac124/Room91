package com.fastcampus.BuDongSan.util;

import com.fastcampus.BuDongSan.dto.LatLngDto;

import java.util.ArrayList;
import java.util.List;

public class PolylineUtils {
    // Google 인코딩 → 위·경도 리스트
    public static List<LatLngDto> decode(String encoded) {
        List<LatLngDto> path = new ArrayList<>();
        int index = 0, len = encoded.length();
        int lat = 0, lng = 0;

        while (index < len) {
            int b, shift = 0, result = 0;
            do {
                b = encoded.charAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            lat += ((result & 1) != 0) ? ~(result >> 1) : (result >> 1);

            shift = 0; result = 0;
            do {
                b = encoded.charAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            lng += ((result & 1) != 0) ? ~(result >> 1) : (result >> 1);

            path.add(new LatLngDto(lat / 1e5, lng / 1e5));
        }
        return path;
    }
}
