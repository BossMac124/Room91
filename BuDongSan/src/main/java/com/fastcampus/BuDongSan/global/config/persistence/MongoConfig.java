package com.fastcampus.BuDongSan.global.config.persistence;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Configuration
@EnableMongoRepositories
public class MongoConfig {
    @Bean
    public MongoCustomConversions customConversions() {
        return new MongoCustomConversions(List.of(
                new Converter<Integer, LocalDate>() {
                    @Override
                    public LocalDate convert(Integer source) {
                        return LocalDate.parse(String.valueOf(source), DateTimeFormatter.BASIC_ISO_DATE);
                    }
                },
                new Converter<LocalDate, Integer>() {
                    @Override
                    public Integer convert(LocalDate source) {
                        return Integer.valueOf(source.format(DateTimeFormatter.BASIC_ISO_DATE));
                    }
                }
        ));
    }
}


